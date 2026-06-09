import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { sessionsApi, type Session, type SessionStatus } from '@/api/sessions'
import { childrenApi, type Child } from '@/api/children'
import { audioApi } from '@/api/audio'
import { analysisApi, type AnalysisJob } from '@/api/analysis'
import { transcriptApi, type Transcript, type SpeakerRole } from '@/api/transcript'
import { soapNoteApi, type SoapNote } from '@/api/soapNote'
import { Icon } from '@/components/common/Icon'
import { useToast } from '@/hooks/useToast'
import { cn, formatDate, formatSeconds } from '@/lib/utils'

type Step = 1 | 2 | 3 | 4

const STEPS = [
  { id: 1, label: '음성 업로드', sub: 'Upload' },
  { id: 2, label: 'AI 분석',    sub: 'Analyze' },
  { id: 3, label: '전사 검토',  sub: 'Review' },
  { id: 4, label: '리포트',     sub: 'Report' },
]

function statusToStep(s: SessionStatus): Step {
  if (s === 'CREATED') return 1
  if (s === 'AUDIO_UPLOADED' || s === 'ANALYSIS_PROCESSING' || s === 'FAILED') return 2
  if (s === 'ANALYSIS_COMPLETED') return 3
  return 4
}

const speakerMap: Record<SpeakerRole, { label: string; bg: string; fg: string }> = {
  CHILD:     { label: '아동',   bg: 'bg-brand-100', fg: 'text-brand-700' },
  THERAPIST: { label: '치료사', bg: 'bg-blue-100',  fg: 'text-blue-700' },
  UNKNOWN:   { label: '미상',   bg: 'bg-ink-100',   fg: 'text-ink-600' },
}

const SOAP_LABELS: Record<string, string> = {
  subjective: 'Subjective — 주관적 정보',
  objective:  'Objective — 객관적 정보',
  assessment: 'Assessment — 평가',
  plan:       'Plan — 계획',
}

export default function SessionDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { showToast } = useToast()

  const [session, setSession]       = useState<Session | null>(null)
  const [child, setChild]           = useState<Child | null>(null)
  const [step, setStep]             = useState<Step>(1)
  const [loading, setLoading]       = useState(true)

  const [uploading, setUploading]   = useState(false)
  const [uploadStep, setUploadStep] = useState('')
  const fileInputRef                = useRef<HTMLInputElement>(null)

  const [analysisJob, setAnalysisJob] = useState<AnalysisJob | null>(null)
  const pollRef                       = useRef<ReturnType<typeof setInterval> | null>(null)

  const [transcript, setTranscript] = useState<Transcript | null>(null)
  const [confirming, setConfirming] = useState(false)

  const [soapNote, setSoapNote] = useState<SoapNote | null>(null)

  const fetchSession = useCallback(async () => {
    if (!id) return
    const { data } = await sessionsApi.get(id)
    setSession(data)
    const s = statusToStep(data.status)
    setStep(s)
    return data
  }, [id])

  useEffect(() => {
    if (!id) return
    setLoading(true)
    sessionsApi.get(id)
      .then(async ({ data: sess }) => {
        setSession(sess)
        const s = statusToStep(sess.status)
        setStep(s)

        const [childRes] = await Promise.all([
          childrenApi.get(sess.child_id),
        ])
        setChild(childRes.data)

        if (s === 2) {
          const jobRes = await analysisApi.list({ session_id: id })
          if (jobRes.data.length > 0) setAnalysisJob(jobRes.data[0])
        }
        if (s === 3) {
          const txRes = await transcriptApi.getBySession(id)
          setTranscript(txRes.data)
        }
        if (s === 4) {
          const [txRes, soapRes] = await Promise.all([
            transcriptApi.getBySession(id),
            soapNoteApi.list({ sessionId: id }),
          ])
          setTranscript(txRes.data)
          if (soapRes.data.length > 0) setSoapNote(soapRes.data[0])
        }
      })
      .catch(() => showToast({ title: '세션 정보를 불러오지 못했습니다', kind: 'error' }))
      .finally(() => setLoading(false))
  }, [id])

  useEffect(() => {
    if (step !== 2) {
      if (pollRef.current) clearInterval(pollRef.current)
      return
    }
    pollRef.current = setInterval(async () => {
      if (!id) return
      const { data: sess } = await sessionsApi.get(id)
      setSession(sess)
      const newStep = statusToStep(sess.status)
      if (newStep !== 2) {
        setStep(newStep)
        if (pollRef.current) clearInterval(pollRef.current)
        if (newStep === 3) {
          transcriptApi.getBySession(id).then(({ data }) => setTranscript(data))
        }
      } else {
        const jobRes = await analysisApi.list({ session_id: id })
        if (jobRes.data.length > 0) setAnalysisJob(jobRes.data[0])
      }
    }, 10_000)
    return () => { if (pollRef.current) clearInterval(pollRef.current) }
  }, [step, id])

  const handleFileUpload = async (file: File) => {
    if (!id) return
    setUploading(true)
    try {
      setUploadStep('presigned URL 발급 중…')
      const { data: presigned } = await audioApi.presignedUrl({
        file_name:    file.name,
        content_type: file.type,
        session_id:   id,
        file_size:    file.size,
      })

      setUploadStep('S3에 업로드 중…')
      await audioApi.uploadToS3(presigned.upload_url, file)

      setUploadStep('업로드 확인 중…')
      const { data: audioFile } = await audioApi.complete({
        session_id: id,
        s3_key:     presigned.s3_key,
      })

      setUploadStep('AI 분석 요청 중…')
      const { data: job } = await analysisApi.create({
        session_id:    id,
        audio_file_id: audioFile.id,
      })
      setAnalysisJob(job)

      showToast({ title: '음성 파일이 업로드되었습니다', body: 'AI 분석을 시작합니다.', kind: 'success' })
      await fetchSession()
    } catch {
      showToast({ title: '업로드에 실패했습니다', body: '파일 형식 및 네트워크를 확인해주세요.', kind: 'error' })
    } finally {
      setUploading(false)
      setUploadStep('')
    }
  }

  const handleConfirmTranscript = async () => {
    if (!transcript?.result_id || !id) return
    setConfirming(true)
    try {
      await transcriptApi.confirm(transcript.result_id)
      await soapNoteApi.generate({ sessionId: id, transcriptId: transcript.result_id })
      showToast({ title: '전사가 확정되었습니다', body: 'SOAP Note를 생성하고 있습니다.', kind: 'success' })
      const [sessData, soapRes] = await Promise.all([
        fetchSession(),
        soapNoteApi.list({ sessionId: id }),
      ])
      if (soapRes.data.length > 0) setSoapNote(soapRes.data[0])
      if (sessData) setStep(statusToStep(sessData.status))
    } catch {
      showToast({ title: '전사 확정에 실패했습니다', kind: 'error' })
    } finally {
      setConfirming(false)
    }
  }

  if (loading) {
    return <div className="px-8 pt-7 text-[13px] text-ink-400">불러오는 중…</div>
  }
  if (!session) {
    return <div className="px-8 pt-7 text-[13px] text-ink-500">세션을 찾을 수 없습니다.</div>
  }

  return (
    <div>
      {/* Header */}
      <div className="px-8 pt-7 pb-5 flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-ink-500 hover:bg-ink-100 transition-colors"
        >
          <Icon name="arrowLeft" size={16} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-ink-800 tracking-tight">
            세션 — {child?.name ?? '—'}
          </h1>
          <p className="text-[13px] text-ink-500 mt-0.5">
            {formatDate(session.session_date)} · {session.session_type ?? '—'}
          </p>
        </div>
      </div>

      <div className="px-8 pb-8 flex flex-col gap-5">
        {/* Stepper */}
        <div className="bg-white rounded-xl border border-ink-200 shadow-sm p-6">
          <div className="flex items-center">
            {STEPS.map((s, i) => {
              const done   = step > s.id
              const active = step === s.id
              return (
                <div key={s.id} className="flex items-center flex-1 last:flex-none">
                  <div className="flex flex-col items-center gap-2">
                    <div className={cn(
                      'w-8 h-8 rounded-full flex items-center justify-center text-[13px] font-bold border-2 transition-all',
                      done   ? 'bg-brand-700 border-brand-700 text-white' :
                      active ? 'bg-white border-brand-700 text-brand-700 shadow-[0_0_0_5px_rgba(26,60,52,0.12)]' :
                               'bg-white border-ink-300 text-ink-400',
                    )}>
                      {done ? <Icon name="check" size={14} strokeWidth={3} /> : s.id}
                    </div>
                    <div className="text-center">
                      <p className={cn('text-[12px] whitespace-nowrap', done || active ? 'font-semibold text-ink-800' : 'text-ink-400')}>{s.label}</p>
                      <p className="text-[10px] text-ink-400">{s.sub}</p>
                    </div>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div className={cn('flex-1 h-0.5 mx-2 mb-6', done ? 'bg-brand-700' : 'bg-ink-200')} />
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Step 1 — Upload */}
        {step === 1 && (
          <div className="bg-white rounded-xl border border-ink-200 shadow-sm">
            <div className="px-6 py-4 border-b border-ink-100">
              <p className="text-[16px] font-semibold text-ink-800">음성 파일 업로드</p>
            </div>
            <div className="p-6">
              <input
                ref={fileInputRef}
                type="file"
                accept="audio/*,.wav,.mp3,.m4a"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) handleFileUpload(file)
                }}
              />
              <div
                className={cn(
                  'border-2 border-dashed rounded-xl p-10 text-center transition-colors',
                  uploading ? 'border-brand-400 bg-brand-25 cursor-wait' : 'border-ink-200 hover:border-brand-400 cursor-pointer',
                )}
                onClick={() => !uploading && fileInputRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault()
                  if (uploading) return
                  const file = e.dataTransfer.files?.[0]
                  if (file) handleFileUpload(file)
                }}
              >
                <div className="w-14 h-14 rounded-xl bg-brand-50 flex items-center justify-center text-brand-600 mx-auto mb-3">
                  {uploading
                    ? <div className="w-6 h-6 rounded-full border-2 border-brand-200 border-t-brand-700" style={{ animation: 'spin 0.8s linear infinite' }} />
                    : <Icon name="upload" size={24} strokeWidth={1.8} />
                  }
                </div>
                {uploading ? (
                  <>
                    <p className="font-semibold text-ink-800">업로드 중…</p>
                    <p className="text-[12px] text-ink-500 mt-1">{uploadStep}</p>
                  </>
                ) : (
                  <>
                    <p className="font-semibold text-ink-800">파일을 드래그하거나 클릭해서 업로드</p>
                    <p className="text-[12px] text-ink-500 mt-1">WAV, MP3, M4A · 최대 500MB</p>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Step 2 — Analysis */}
        {step === 2 && (
          <div className="bg-white rounded-xl border border-ink-200 shadow-sm">
            <div className="px-6 py-4 border-b border-ink-100">
              <p className="text-[16px] font-semibold text-ink-800">
                {session.status === 'FAILED' ? 'AI 분석 실패' : 'AI 분석 중'}
              </p>
            </div>
            <div className="p-6 text-center">
              {session.status === 'FAILED' ? (
                <>
                  <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center text-red-500 mx-auto mb-4">
                    <Icon name="alert" size={28} strokeWidth={1.8} />
                  </div>
                  <p className="font-semibold text-ink-800">분석 중 오류가 발생했습니다</p>
                  <p className="text-[12px] text-ink-500 mt-1">
                    {analysisJob?.error_message ?? '알 수 없는 오류'}
                  </p>
                </>
              ) : (
                <>
                  <div className="w-16 h-16 rounded-full border-4 border-brand-200 border-t-brand-700 mx-auto mb-4"
                    style={{ animation: 'spin 1s linear infinite' }} />
                  <p className="font-semibold text-ink-800">음성을 분석하고 있습니다</p>
                  <p className="text-[12px] text-ink-500 mt-1">
                    {analysisJob?.current_stage
                      ? `현재 단계: ${analysisJob.current_stage}`
                      : '평균 2–3분 소요됩니다'}
                  </p>
                  {analysisJob && analysisJob.progress > 0 && (
                    <div className="mt-4 max-w-[240px] mx-auto">
                      <div className="h-1.5 bg-ink-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-brand-700 transition-all"
                          style={{ width: `${analysisJob.progress}%` }}
                        />
                      </div>
                      <p className="text-[11px] text-ink-400 mt-1">{analysisJob.progress}%</p>
                    </div>
                  )}
                  <p className="text-[11px] text-ink-400 mt-4">페이지를 벗어나도 분석은 계속됩니다.</p>
                </>
              )}
            </div>
          </div>
        )}

        {/* Step 3 — Transcript review */}
        {step === 3 && transcript && (
          <div className="bg-white rounded-xl border border-ink-200 shadow-sm">
            <div className="flex items-center justify-between px-6 py-4 border-b border-ink-100">
              <p className="text-[16px] font-semibold text-ink-800">전사 검토</p>
              <button
                onClick={handleConfirmTranscript}
                disabled={confirming}
                className="flex items-center gap-1.5 px-4 py-2 bg-brand-700 text-white rounded-full text-[13px] font-semibold hover:bg-brand-900 transition-colors disabled:opacity-60"
              >
                <Icon name="chevronRight" size={14} />
                {confirming ? '처리 중…' : '리포트 보기'}
              </button>
            </div>
            <div className="p-6 flex flex-col gap-3">
              {transcript.segments.length === 0 ? (
                <p className="text-[13px] text-ink-400 text-center py-8">전사 결과가 없습니다.</p>
              ) : (
                transcript.segments.map((seg) => {
                  const role = seg.speaker_role ?? 'UNKNOWN'
                  const s = speakerMap[role]
                  const text = seg.final_text ?? seg.edited_text ?? seg.original_text ?? ''
                  const isEdited = !!seg.edited_text && seg.edited_text !== seg.original_text
                  return (
                    <div key={seg.id} className="flex gap-3 items-start">
                      <span className="text-[11px] font-mono text-ink-400 pt-0.5 w-14 flex-shrink-0">
                        {formatSeconds(seg.start_time)}
                      </span>
                      <span className={cn('text-[11px] font-semibold px-2 py-0.5 rounded-md flex-shrink-0', s.bg, s.fg)}>
                        {s.label}
                      </span>
                      <p className={cn('text-[13px] leading-relaxed', isEdited ? 'text-brand-700' : 'text-ink-700')}>
                        {text}
                      </p>
                      {isEdited && (
                        <span className="text-[10px] text-brand-500 font-semibold mt-0.5 flex-shrink-0">수정됨</span>
                      )}
                    </div>
                  )
                })
              )}
            </div>
          </div>
        )}

        {/* Step 4 — SOAP Note / Report */}
        {step === 4 && (
          <div className="bg-white rounded-xl border border-ink-200 shadow-sm">
            <div className="flex items-center justify-between px-6 py-4 border-b border-ink-100">
              <p className="text-[16px] font-semibold text-ink-800">SOAP Note</p>
            </div>
            {soapNote ? (
              <div className="p-6 grid grid-cols-2 gap-4">
                {(['subjective', 'objective', 'assessment', 'plan'] as const).map((key) => (
                  <div key={key} className="bg-ink-50 rounded-xl p-4">
                    <p className="text-[11px] font-bold text-brand-700 uppercase tracking-wide mb-1.5">
                      {SOAP_LABELS[key]}
                    </p>
                    <p className="text-[13px] text-ink-700 leading-relaxed whitespace-pre-wrap">
                      {soapNote[key] ?? '—'}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center text-[13px] text-ink-400">
                SOAP Note를 불러오는 중…
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
