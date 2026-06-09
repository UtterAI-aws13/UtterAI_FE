import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { sessionsApi, type Session, type SessionStatus } from '@/api/sessions'
import { childrenApi, type Child } from '@/api/children'
import { audioApi } from '@/api/audio'
import { analysisApi, type AnalysisJob } from '@/api/analysis'
import { transcriptsApi, type Transcript } from '@/api/transcripts'
import { analysisResultApi, type TranscriptSegment, type SpeakerRole, type AnalysisResultSpeaker } from '@/api/analysisResult'
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

type SoapField = 'subjective' | 'objective' | 'assessment' | 'plan'

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
  const [cancelling, setCancelling]   = useState(false)

  const [transcript, setTranscript]   = useState<Transcript | null>(null)
  const [confirming, setConfirming]   = useState(false)
  const [editingSegId, setEditingSegId] = useState<string | null>(null)
  const [editText, setEditText]         = useState('')
  const [editRole, setEditRole]         = useState<SpeakerRole>('UNKNOWN')
  const [savingSeg, setSavingSeg]       = useState(false)

  const [soapNote, setSoapNote]           = useState<SoapNote | null>(null)
  const [soapEdits, setSoapEdits]         = useState<Record<SoapField, string>>({ subjective: '', objective: '', assessment: '', plan: '' })
  const [savingSoap, setSavingSoap]       = useState(false)
  const [finalizingSoap, setFinalizingSoap] = useState(false)

  const [speakers, setSpeakers]               = useState<AnalysisResultSpeaker[]>([])
  const [interpretationText, setInterpretationText] = useState<string | null>(null)

  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting]           = useState(false)

  const fetchSession = useCallback(async () => {
    if (!id) return
    const { data } = await sessionsApi.get(id)
    setSession(data)
    setStep(statusToStep(data.status))
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
        const [childRes] = await Promise.all([childrenApi.get(sess.child_id)])
        setChild(childRes.data)
        if (s === 2) {
          const jobRes = await analysisApi.list({ session_id: id })
          if (jobRes.data.length > 0) setAnalysisJob(jobRes.data[0])
        }
        if (s === 3) {
          const txRes = await transcriptsApi.getBySession(id)
          setTranscript(txRes.data)
        }
        if (s === 4) {
          const [txRes, soapRes, resultRes] = await Promise.all([
            transcriptsApi.getBySession(id),
            soapNoteApi.list({ sessionId: id }),
            analysisApi.getResultsBySession(id),
          ])
          setTranscript(txRes.data)
          if (soapRes.data.length > 0) setSoapNote(soapRes.data[0])
          if (resultRes.data.length > 0) {
            const result = resultRes.data[0]
            setInterpretationText(result.interpretation_text)
            const resultId = result.id ?? result.result_id
            if (resultId) {
              try {
                const speakerRes = await analysisResultApi.getSpeakers(resultId)
                setSpeakers(speakerRes.data.speakers)
              } catch { /* optional */ }
            }
          }
        }
      })
      .catch(() => showToast({ title: '세션 정보를 불러오지 못했습니다', kind: 'error' }))
      .finally(() => setLoading(false))
  }, [id])

  useEffect(() => {
    if (soapNote) {
      setSoapEdits({
        subjective: soapNote.subjective ?? '',
        objective:  soapNote.objective  ?? '',
        assessment: soapNote.assessment ?? '',
        plan:       soapNote.plan       ?? '',
      })
    }
  }, [soapNote?.id])

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
        if (newStep === 3) transcriptsApi.getBySession(id).then(({ data }) => setTranscript(data))
      } else {
        const jobRes = await analysisApi.list({ session_id: id })
        if (jobRes.data.length > 0) setAnalysisJob(jobRes.data[0])
      }
    }, 10_000)
    return () => { if (pollRef.current) clearInterval(pollRef.current) }
  }, [step, id])

  // ── Upload ────────────────────────────────────────────────────
  const handleFileUpload = async (file: File) => {
    if (!id) return
    setUploading(true)
    try {
      setUploadStep('presigned URL 발급 중…')
      const { data: presigned } = await audioApi.presignedUrl({
        file_name: file.name, content_type: file.type, session_id: id, file_size: file.size,
      })
      setUploadStep('S3에 업로드 중…')
      await audioApi.uploadToS3(presigned.upload_url, file)
      setUploadStep('업로드 확인 중…')
      const { data: audioFile } = await audioApi.complete({ session_id: id, s3_key: presigned.s3_key })
      setUploadStep('AI 분석 요청 중…')
      const { data: job } = await analysisApi.create({ session_id: id, audio_file_id: audioFile.id })
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

  // ── Analysis cancel ───────────────────────────────────────────
  const handleCancelAnalysis = async () => {
    if (!analysisJob) return
    setCancelling(true)
    try {
      await analysisApi.cancel(analysisJob.id)
      showToast({ title: '분석이 취소되었습니다', kind: 'info' })
      await fetchSession()
    } catch {
      showToast({ title: '취소에 실패했습니다', kind: 'error' })
    } finally {
      setCancelling(false)
    }
  }

  // ── Transcript segment editing ────────────────────────────────
  const startEditSeg = (seg: TranscriptSegment) => {
    setEditingSegId(seg.id)
    setEditText(seg.final_text ?? seg.edited_text ?? seg.original_text ?? '')
    setEditRole(seg.speaker_role ?? 'UNKNOWN')
  }

  const cancelEditSeg = () => setEditingSegId(null)

  const saveEditSeg = async (seg: TranscriptSegment) => {
    if (!transcript?.result_id) return
    setSavingSeg(true)
    try {
      const { data } = await transcriptsApi.updateSegment(transcript.result_id, seg.id, {
        text: editText, speaker_role: editRole,
      })
      setTranscript((t) => t ? { ...t, segments: t.segments.map((s) => s.id === data.id ? data : s) } : t)
      setEditingSegId(null)
    } catch {
      showToast({ title: '저장에 실패했습니다', kind: 'error' })
    } finally {
      setSavingSeg(false)
    }
  }

  // ── Transcript confirm ────────────────────────────────────────
  const handleConfirmTranscript = async () => {
    if (!transcript?.result_id || !id) return
    setConfirming(true)
    try {
      await transcriptsApi.confirm(transcript.result_id)
      await soapNoteApi.generate({ sessionId: id, transcriptId: transcript.result_id })
      showToast({ title: '전사가 확정되었습니다', body: 'SOAP Note를 생성하고 있습니다.', kind: 'success' })
      const [sessData, soapRes] = await Promise.all([fetchSession(), soapNoteApi.list({ sessionId: id })])
      if (soapRes.data.length > 0) setSoapNote(soapRes.data[0])
      if (sessData) setStep(statusToStep(sessData.status))
    } catch {
      showToast({ title: '전사 확정에 실패했습니다', kind: 'error' })
    } finally {
      setConfirming(false)
    }
  }

  // ── SOAP note editing ─────────────────────────────────────────
  const handleSaveSoap = async () => {
    if (!soapNote) return
    setSavingSoap(true)
    try {
      const { data: updated } = await soapNoteApi.update(soapNote.id, soapEdits)
      await soapNoteApi.save(updated.id)
      setSoapNote(updated)
      showToast({ title: 'SOAP Note가 저장되었습니다', kind: 'success' })
    } catch {
      showToast({ title: '저장에 실패했습니다', kind: 'error' })
    } finally {
      setSavingSoap(false)
    }
  }

  const handleFinalizeSoap = async () => {
    if (!soapNote) return
    setFinalizingSoap(true)
    try {
      const { data } = await soapNoteApi.finalize(soapNote.id)
      setSoapNote(data)
      showToast({ title: 'SOAP Note가 확정되었습니다', kind: 'success' })
    } catch {
      showToast({ title: '확정에 실패했습니다', kind: 'error' })
    } finally {
      setFinalizingSoap(false)
    }
  }

  // ── Session delete ────────────────────────────────────────────
  const handleDeleteSession = async () => {
    if (!id) return
    setDeleting(true)
    try {
      await sessionsApi.delete(id)
      showToast({ title: '세션이 삭제되었습니다', kind: 'success' })
      navigate('/sessions')
    } catch {
      showToast({ title: '세션 삭제에 실패했습니다', kind: 'error' })
      setDeleting(false)
      setConfirmDelete(false)
    }
  }

  if (loading) return <div className="px-8 pt-7 text-[13px] text-ink-400">불러오는 중…</div>
  if (!session) return <div className="px-8 pt-7 text-[13px] text-ink-500">세션을 찾을 수 없습니다.</div>

  const isFinalized = soapNote?.status === 'FINALIZED'

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
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-ink-800 tracking-tight">
            세션 — {child?.name ?? '—'}
          </h1>
          <p className="text-[13px] text-ink-500 mt-0.5">
            {formatDate(session.session_date)} · {session.session_type ?? '—'}
          </p>
        </div>

        {/* Delete */}
        {confirmDelete ? (
          <div className="flex items-center gap-2">
            <span className="text-[13px] text-red-600 font-medium">삭제하시겠어요?</span>
            <button
              onClick={handleDeleteSession}
              disabled={deleting}
              className="px-3 py-1.5 bg-red-600 text-white rounded-full text-[12px] font-semibold hover:bg-red-700 disabled:opacity-60 transition-colors"
            >
              {deleting ? '삭제 중…' : '확인'}
            </button>
            <button
              onClick={() => setConfirmDelete(false)}
              className="px-3 py-1.5 border border-ink-200 text-ink-600 rounded-full text-[12px] font-semibold hover:bg-ink-50 transition-colors"
            >
              취소
            </button>
          </div>
        ) : (
          <button
            onClick={() => setConfirmDelete(true)}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-ink-400 hover:bg-red-50 hover:text-red-600 transition-colors"
            title="세션 삭제"
          >
            <Icon name="trash" size={15} />
          </button>
        )}
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
                onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFileUpload(f) }}
              />
              <div
                className={cn(
                  'border-2 border-dashed rounded-xl p-10 text-center transition-colors',
                  uploading ? 'border-brand-400 bg-brand-25 cursor-wait' : 'border-ink-200 hover:border-brand-400 cursor-pointer',
                )}
                onClick={() => !uploading && fileInputRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => { e.preventDefault(); if (!uploading) { const f = e.dataTransfer.files?.[0]; if (f) handleFileUpload(f) } }}
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
                  <p className="text-[12px] text-ink-500 mt-1">{analysisJob?.error_message ?? '알 수 없는 오류'}</p>
                </>
              ) : (
                <>
                  <div className="w-16 h-16 rounded-full border-4 border-brand-200 border-t-brand-700 mx-auto mb-4"
                    style={{ animation: 'spin 1s linear infinite' }} />
                  <p className="font-semibold text-ink-800">음성을 분석하고 있습니다</p>
                  <p className="text-[12px] text-ink-500 mt-1">
                    {analysisJob?.current_stage ? `현재 단계: ${analysisJob.current_stage}` : '평균 2–3분 소요됩니다'}
                  </p>
                  {analysisJob && analysisJob.progress > 0 && (
                    <div className="mt-4 max-w-[240px] mx-auto">
                      <div className="h-1.5 bg-ink-100 rounded-full overflow-hidden">
                        <div className="h-full bg-brand-700 transition-all" style={{ width: `${analysisJob.progress}%` }} />
                      </div>
                      <p className="text-[11px] text-ink-400 mt-1">{analysisJob.progress}%</p>
                    </div>
                  )}
                  <p className="text-[11px] text-ink-400 mt-4">페이지를 벗어나도 분석은 계속됩니다.</p>
                  {analysisJob && (
                    <button
                      onClick={handleCancelAnalysis}
                      disabled={cancelling}
                      className="mt-4 px-4 py-1.5 border border-ink-200 text-ink-500 rounded-full text-[12px] font-semibold hover:bg-ink-50 disabled:opacity-60 transition-colors"
                    >
                      {cancelling ? '취소 중…' : '분석 취소'}
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        )}

        {/* Step 3 — Transcript review */}
        {step === 3 && transcript && (
          <div className="bg-white rounded-xl border border-ink-200 shadow-sm">
            <div className="flex items-center justify-between px-6 py-4 border-b border-ink-100">
              <div>
                <p className="text-[16px] font-semibold text-ink-800">전사 검토</p>
                <p className="text-[12px] text-ink-500 mt-0.5">텍스트나 화자를 수정한 뒤 확정하세요</p>
              </div>
              <button
                onClick={handleConfirmTranscript}
                disabled={confirming || !!editingSegId}
                className="flex items-center gap-1.5 px-4 py-2 bg-brand-700 text-white rounded-full text-[13px] font-semibold hover:bg-brand-900 transition-colors disabled:opacity-60"
              >
                <Icon name="chevronRight" size={14} />
                {confirming ? '처리 중…' : '전사 확정'}
              </button>
            </div>
            <div className="divide-y divide-ink-50">
              {transcript.segments.length === 0 ? (
                <p className="text-[13px] text-ink-400 text-center py-8">전사 결과가 없습니다.</p>
              ) : (
                transcript.segments.map((seg) => {
                  const isEditing = editingSegId === seg.id
                  const role = seg.speaker_role ?? 'UNKNOWN'
                  const s = speakerMap[role]
                  const text = seg.final_text ?? seg.edited_text ?? seg.original_text ?? ''
                  const isEdited = !!seg.edited_text && seg.edited_text !== seg.original_text

                  return (
                    <div key={seg.id} className={cn('flex gap-3 items-start px-6 py-3', isEditing ? 'bg-brand-25' : 'hover:bg-ink-50 group')}>
                      <span className="text-[11px] font-mono text-ink-400 pt-1 w-14 flex-shrink-0">
                        {formatSeconds(seg.start_time)}
                      </span>

                      {isEditing ? (
                        <select
                          value={editRole}
                          onChange={(e) => setEditRole(e.target.value as SpeakerRole)}
                          className="text-[11px] font-semibold border border-ink-200 rounded-md px-1.5 py-0.5 bg-white outline-none focus:border-brand-500 flex-shrink-0 h-fit mt-0.5"
                        >
                          <option value="CHILD">아동</option>
                          <option value="THERAPIST">치료사</option>
                          <option value="UNKNOWN">미상</option>
                        </select>
                      ) : (
                        <span className={cn('text-[11px] font-semibold px-2 py-0.5 rounded-md flex-shrink-0 mt-0.5', s.bg, s.fg)}>
                          {s.label}
                        </span>
                      )}

                      {isEditing ? (
                        <div className="flex-1 flex flex-col gap-2">
                          <textarea
                            value={editText}
                            onChange={(e) => setEditText(e.target.value)}
                            rows={3}
                            autoFocus
                            className="w-full px-3 py-2 rounded-lg text-[13px] border border-brand-400 bg-white outline-none focus:ring-2 focus:ring-brand-500/16 resize-none font-sans leading-relaxed"
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={() => saveEditSeg(seg)}
                              disabled={savingSeg}
                              className="px-3 py-1 bg-brand-700 text-white rounded-full text-[12px] font-semibold hover:bg-brand-900 disabled:opacity-60 transition-colors"
                            >
                              {savingSeg ? '저장 중…' : '저장'}
                            </button>
                            <button
                              onClick={cancelEditSeg}
                              className="px-3 py-1 border border-ink-200 text-ink-600 rounded-full text-[12px] font-semibold hover:bg-ink-50 transition-colors"
                            >
                              취소
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <p className={cn('text-[13px] leading-relaxed flex-1', isEdited ? 'text-brand-700' : 'text-ink-700')}>
                            {text}
                            {isEdited && <span className="ml-1.5 text-[10px] text-brand-500 font-semibold">수정됨</span>}
                          </p>
                          <button
                            onClick={() => startEditSeg(seg)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity w-6 h-6 flex items-center justify-center rounded-md text-ink-400 hover:bg-ink-100 flex-shrink-0 mt-0.5"
                          >
                            <Icon name="edit" size={13} />
                          </button>
                        </>
                      )}
                    </div>
                  )
                })
              )}
            </div>
          </div>
        )}

        {/* Step 4 — Analysis summary */}
        {step === 4 && (speakers.length > 0 || interpretationText) && (
          <div className="bg-white rounded-xl border border-ink-200 shadow-sm">
            <div className="px-6 py-4 border-b border-ink-100">
              <p className="text-[16px] font-semibold text-ink-800">분석 요약</p>
            </div>
            <div className="p-6 flex flex-col gap-5">
              {speakers.length > 0 && (
                <div>
                  <p className="text-[12px] font-semibold text-ink-500 uppercase tracking-wide mb-3">발화 통계</p>
                  <div className="flex flex-wrap gap-3">
                    {speakers.map((sp) => {
                      const s = speakerMap[sp.speaker_role] ?? speakerMap.UNKNOWN
                      return (
                        <div key={sp.speaker_id} className={cn('flex items-center gap-2.5 px-4 py-2.5 rounded-xl border', s.bg, 'border-transparent')}>
                          <span className={cn('text-[13px] font-semibold', s.fg)}>{s.label}</span>
                          <span className="text-[11px] text-ink-400">·</span>
                          <span className="text-[13px] font-bold text-ink-800">{sp.utterance_count.toLocaleString()}</span>
                          <span className="text-[11px] text-ink-500">발화</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
              {interpretationText && (
                <div>
                  <p className="text-[12px] font-semibold text-ink-500 uppercase tracking-wide mb-2">AI 해석</p>
                  <p className="text-[13px] text-ink-700 leading-relaxed whitespace-pre-wrap">{interpretationText}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 4 — SOAP Note */}
        {step === 4 && (
          <div className="bg-white rounded-xl border border-ink-200 shadow-sm">
            <div className="flex items-center justify-between px-6 py-4 border-b border-ink-100">
              <div>
                <p className="text-[16px] font-semibold text-ink-800">SOAP Note</p>
                {isFinalized && (
                  <span className="inline-flex items-center gap-1 mt-1 text-[11px] font-semibold text-green-700 bg-green-100 px-2 py-0.5 rounded-md">
                    <Icon name="check" size={11} strokeWidth={3} />확정됨
                  </span>
                )}
              </div>
              {!isFinalized && soapNote && (
                <div className="flex gap-2">
                  <button
                    onClick={handleSaveSoap}
                    disabled={savingSoap}
                    className="px-4 py-2 border border-ink-200 text-ink-700 rounded-full text-[13px] font-semibold hover:bg-ink-50 disabled:opacity-60 transition-colors"
                  >
                    {savingSoap ? '저장 중…' : '임시 저장'}
                  </button>
                  <button
                    onClick={handleFinalizeSoap}
                    disabled={finalizingSoap}
                    className="px-4 py-2 bg-brand-700 text-white rounded-full text-[13px] font-semibold hover:bg-brand-900 disabled:opacity-60 transition-colors"
                  >
                    {finalizingSoap ? '처리 중…' : '확정'}
                  </button>
                </div>
              )}
            </div>
            {soapNote ? (
              <div className="p-6 grid grid-cols-2 gap-4">
                {(['subjective', 'objective', 'assessment', 'plan'] as const).map((key) => (
                  <div key={key} className="bg-ink-50 rounded-xl p-4">
                    <p className="text-[11px] font-bold text-brand-700 uppercase tracking-wide mb-2">
                      {SOAP_LABELS[key]}
                    </p>
                    {isFinalized ? (
                      <p className="text-[13px] text-ink-700 leading-relaxed whitespace-pre-wrap">
                        {soapNote[key] ?? '—'}
                      </p>
                    ) : (
                      <textarea
                        value={soapEdits[key]}
                        onChange={(e) => setSoapEdits((prev) => ({ ...prev, [key]: e.target.value }))}
                        rows={5}
                        className="w-full bg-white rounded-lg px-3 py-2 text-[13px] text-ink-700 leading-relaxed border border-ink-200 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/16 resize-none font-sans"
                      />
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center text-[13px] text-ink-400">SOAP Note를 불러오는 중…</div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
