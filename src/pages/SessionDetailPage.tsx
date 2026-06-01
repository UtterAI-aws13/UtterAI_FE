import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Icon } from '@/components/common/Icon'
import { useToast } from '@/hooks/useToast'
import { cn } from '@/lib/utils'
import { sessionsApi, type SessionStatus } from '@/api/sessions'
import { childrenApi } from '@/api/children'
import { uploadSessionAudio } from '@/api/audio'
import { analysisApi, type AnalysisJobStatus } from '@/api/analysis'
import { transcriptsApi, type Transcript } from '@/api/transcripts'
import { soapNoteApi, type SoapNote } from '@/api/soapNote'
import { reportsApi, type Report } from '@/api/reports'
import type { AnalysisResult } from '@/api/analysisResult'

type Step = 1 | 2 | 3 | 4

const STEPS = [
  { id: 1, label: '음성 업로드', sub: 'Upload' },
  { id: 2, label: 'AI 분석',    sub: 'Analyze' },
  { id: 3, label: '전사 검토',   sub: 'Review' },
  { id: 4, label: '리포트',      sub: 'Report' },
]

const SESSION_TYPE_LABEL: Record<string, string> = { INDIVIDUAL: '개별', GROUP: '그룹' }

function fmtDate(iso: string) {
  return iso.slice(0, 10).replaceAll('-', '.')
}

function calcAge(birthDate: string | null): string {
  if (!birthDate) return ''
  const birth = new Date(birthDate)
  const now = new Date()
  const totalMonths =
    (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth())
  return `${Math.floor(totalMonths / 12)}세 ${totalMonths % 12}개월`
}

function statusToStep(s: SessionStatus): Step {
  if (s === 'CREATED' || s === 'AUDIO_UPLOADING') return 1
  if (s === 'AUDIO_UPLOADED' || s === 'ANALYSIS_REQUESTED' || s === 'ANALYSIS_PROCESSING' || s === 'FAILED') return 2
  if (s === 'ANALYSIS_COMPLETED') return 3
  return 4
}

const speakerMap = {
  CHILD:     { label: '아동',   bg: 'bg-brand-100', fg: 'text-brand-700' },
  THERAPIST: { label: '치료사', bg: 'bg-blue-100',  fg: 'text-blue-700' },
  UNKNOWN:   { label: '미상',   bg: 'bg-ink-100',   fg: 'text-ink-600' },
} as const

const ACTIVE_STATUSES: AnalysisJobStatus[] = ['REQUESTED', 'QUEUED', 'PROCESSING']
const DONE_STATUSES: AnalysisJobStatus[]   = ['COMPLETED', 'FAILED', 'CANCELLED', 'EXPIRED']

export default function SessionDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { showToast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Step override: null means derive from session.status
  const [stepOverride, setStepOverride] = useState<Step | null>(null)

  // Step 1
  const [uploading, setUploading] = useState(false)
  const [audioFileId, setAudioFileId] = useState<string | null>(null)

  // Step 2
  const [analysisJobId, setAnalysisJobId] = useState<string | null>(null)
  const [analysisStatus, setAnalysisStatus] = useState<AnalysisJobStatus | null>(null)
  const [startingAnalysis, setStartingAnalysis] = useState(false)

  // Step 3
  const [transcript, setTranscript] = useState<Transcript | null>(null)
  const [transcriptLoading, setTranscriptLoading] = useState(false)
  const [editingSegId, setEditingSegId] = useState<string | null>(null)
  const [editText, setEditText] = useState('')
  const [speakerDropdownId, setSpeakerDropdownId] = useState<string | null>(null)
  const [updatingSpeakerId, setUpdatingSpeakerId] = useState<string | null>(null)
  const [confirming, setConfirming] = useState(false)

  // Step 4
  const [soapNote, setSoapNote] = useState<SoapNote | null>(null)
  const [soapLoading, setSoapLoading] = useState(false)
  const [report, setReport] = useState<Report | null>(null)
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null)
  const [downloading, setDownloading] = useState(false)

  // ── Data ──────────────────────────────────────────────────────────────────
  const { data: session } = useQuery({
    queryKey: ['session', id],
    queryFn: () => sessionsApi.get(id!).then((r) => r.data),
    enabled: !!id,
  })

  const { data: child } = useQuery({
    queryKey: ['child', session?.child_id],
    queryFn: () => childrenApi.get(session!.child_id).then((r) => r.data),
    enabled: !!session?.child_id,
  })

  const step: Step = stepOverride ?? (session ? statusToStep(session.status) : 1)

  // ── Step 2: load existing analysis job & poll ─────────────────────────────
  useEffect(() => {
    if (step !== 2 || !id) return
    analysisApi.list({ session_id: id }).then(({ data }) => {
      const latest = [...data].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      )[0]
      if (latest) {
        setAnalysisJobId(latest.id)
        setAnalysisStatus(latest.status)
        if (latest.status === 'COMPLETED') setStepOverride(3)
      }
    })
  }, [step, id])

  useEffect(() => {
    if (step !== 2 || !analysisJobId) return
    if (!ACTIVE_STATUSES.includes(analysisStatus as AnalysisJobStatus)) return

    const interval = setInterval(async () => {
      try {
        const { data } = await analysisApi.get(analysisJobId)
        setAnalysisStatus(data.status)
        if (data.status === 'COMPLETED') {
          setStepOverride(3)
          showToast({ title: '분석이 완료되었습니다', kind: 'success' })
        } else if (DONE_STATUSES.includes(data.status)) {
          showToast({ title: '분석에 실패했습니다', kind: 'error' })
        }
      } catch { /* ignore */ }
    }, 5000)
    return () => clearInterval(interval)
  }, [step, analysisJobId, analysisStatus])

  // ── Step 3: load transcript ───────────────────────────────────────────────
  useEffect(() => {
    if (step !== 3 || !id) return
    setTranscriptLoading(true)
    transcriptsApi.getBySession(id)
      .then(({ data }) => setTranscript(data))
      .catch(() => showToast({ title: '전사를 불러오지 못했습니다', kind: 'error' }))
      .finally(() => setTranscriptLoading(false))
  }, [step, id])

  // ── Step 4: load SOAP note + report ──────────────────────────────────────
  useEffect(() => {
    if (step !== 4 || !id) return
    setSoapLoading(true)
    Promise.all([
      soapNoteApi.list({ sessionId: id }),
      sessionsApi.listReports(id),
      sessionsApi.getAnalysisResult(id).catch(() => null),
    ])
      .then(([soapRes, reportRes, resultRes]) => {
        setSoapNote(soapRes.data.find((n) => n.status !== 'DELETED') ?? null)
        setReport(reportRes.data.find((r) => r.status !== 'DELETED') ?? null)
        setAnalysisResult(resultRes?.data ?? null)
      })
      .catch(() => showToast({ title: '데이터를 불러오지 못했습니다', kind: 'error' }))
      .finally(() => setSoapLoading(false))
  }, [step, id])

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleFileSelect = async (file: File) => {
    if (!id) return
    setUploading(true)
    try {
      const audioFile = await uploadSessionAudio(id, file)
      setAudioFileId(audioFile.id)
      setStepOverride(2)
      showToast({ title: '음성 파일이 업로드되었습니다', kind: 'success' })
    } catch {
      showToast({ title: '업로드에 실패했습니다', kind: 'error' })
    } finally {
      setUploading(false)
    }
  }

  const handleStartAnalysis = async () => {
    if (!id || !audioFileId) return
    setStartingAnalysis(true)
    try {
      const { data: job } = await analysisApi.create({ session_id: id, audio_file_id: audioFileId })
      setAnalysisJobId(job.id)
      setAnalysisStatus(job.status)
      showToast({ title: '분석을 요청했습니다', kind: 'success' })
    } catch {
      showToast({ title: '분석 요청에 실패했습니다', kind: 'error' })
    } finally {
      setStartingAnalysis(false)
    }
  }

  const handleEditStart = (segId: string, currentText: string) => {
    setEditingSegId(segId)
    setEditText(currentText)
  }

  const handleEditSave = async (segId: string, originalText: string) => {
    const resultId = transcript?.result_id
    if (!resultId || editText === originalText) {
      setEditingSegId(null)
      return
    }
    try {
      await transcriptsApi.updateSegment(resultId, segId, { text: editText })
      const { data } = await transcriptsApi.getBySession(id!)
      setTranscript(data)
    } catch {
      showToast({ title: '수정에 실패했습니다', kind: 'error' })
    } finally {
      setEditingSegId(null)
    }
  }

  const handleSpeakerChange = async (segId: string, role: 'CHILD' | 'THERAPIST' | 'UNKNOWN') => {
    const resultId = transcript?.result_id
    if (!resultId) return
    setSpeakerDropdownId(null)
    setUpdatingSpeakerId(segId)
    try {
      await transcriptsApi.updateSegment(resultId, segId, { speaker_role: role })
      const { data } = await transcriptsApi.getBySession(id!)
      setTranscript(data)
    } catch {
      showToast({ title: '화자 변경에 실패했습니다', kind: 'error' })
    } finally {
      setUpdatingSpeakerId(null)
    }
  }

  const handleConfirmTranscript = async () => {
    const resultId = transcript?.result_id
    if (!resultId || !id) return
    setConfirming(true)
    try {
      await transcriptsApi.confirm(resultId)
      await soapNoteApi.generate({ sessionId: id, transcriptId: resultId })
      setStepOverride(4)
      showToast({ title: '전사가 확인되었습니다', kind: 'success' })
    } catch {
      showToast({ title: '전사 확인 중 오류가 발생했습니다', kind: 'error' })
    } finally {
      setConfirming(false)
    }
  }

  const handleDownload = async () => {
    if (!report) return
    setDownloading(true)
    try {
      const { data } = await reportsApi.download(report.id)
      const url = URL.createObjectURL(new Blob([data as BlobPart], { type: 'text/plain' }))
      const a = document.createElement('a')
      a.href = url
      a.download = `${report.title}.txt`
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      showToast({ title: '다운로드에 실패했습니다', kind: 'error' })
    } finally {
      setDownloading(false)
    }
  }

  // ── Header info ───────────────────────────────────────────────────────────
  const headerTitle = child
    ? `${child.name} — ${fmtDate(session?.session_date ?? '')}`
    : session
    ? fmtDate(session.session_date)
    : '세션 상세'

  const headerSub = [
    child ? calcAge(child.birth_date) : null,
    child?.gender === 'F' ? '여아' : child?.gender === 'M' ? '남아' : null,
    SESSION_TYPE_LABEL[session?.session_type ?? ''] ?? session?.session_type ?? null,
  ].filter(Boolean).join(' · ')

  return (
    <div>
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="audio/*,.wav,.mp3,.m4a,.ogg"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) handleFileSelect(file)
          e.target.value = ''
        }}
      />

      {/* Header */}
      <div className="px-8 pt-7 pb-5 flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-ink-500 hover:bg-ink-100 transition-colors"
        >
          <Icon name="arrowLeft" size={16} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-ink-800 tracking-tight">{headerTitle}</h1>
          {headerSub && <p className="text-[13px] text-ink-500 mt-0.5">{headerSub}</p>}
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
                  <div
                    className="flex flex-col items-center gap-2 cursor-pointer"
                    onClick={() => { if (done) setStepOverride(s.id as Step) }}
                  >
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

        {/* ── Step 1: Upload ───────────────────────────────────────────────── */}
        {step === 1 && (
          <div className="bg-white rounded-xl border border-ink-200 shadow-sm">
            <div className="px-6 py-4 border-b border-ink-100">
              <p className="text-[16px] font-semibold text-ink-800">음성 파일 업로드</p>
            </div>
            <div className="p-6">
              <div
                className={cn(
                  'border-2 border-dashed border-ink-200 rounded-xl p-10 text-center transition-colors',
                  uploading ? 'opacity-60 cursor-wait' : 'hover:border-brand-400 cursor-pointer',
                )}
                onClick={() => !uploading && fileInputRef.current?.click()}
              >
                <div className="w-14 h-14 rounded-xl bg-brand-50 flex items-center justify-center text-brand-600 mx-auto mb-3">
                  {uploading
                    ? <div className="w-6 h-6 rounded-full border-2 border-brand-200 border-t-brand-700" style={{ animation: 'spin 1s linear infinite' }} />
                    : <Icon name="upload" size={24} strokeWidth={1.8} />
                  }
                </div>
                <p className="font-semibold text-ink-800">
                  {uploading ? '업로드 중…' : '파일을 드래그하거나 클릭해서 업로드'}
                </p>
                <p className="text-[12px] text-ink-500 mt-1">WAV, MP3, M4A · 최대 500MB</p>
              </div>
            </div>
          </div>
        )}

        {/* ── Step 2: Analyze ──────────────────────────────────────────────── */}
        {step === 2 && (
          <div className="bg-white rounded-xl border border-ink-200 shadow-sm">
            <div className="px-6 py-4 border-b border-ink-100">
              <p className="text-[16px] font-semibold text-ink-800">AI 분석</p>
            </div>
            <div className="p-6 text-center">
              {!analysisJobId || session?.status === 'AUDIO_UPLOADED' ? (
                <>
                  <div className="w-14 h-14 rounded-xl bg-brand-50 flex items-center justify-center text-brand-600 mx-auto mb-3">
                    <Icon name="audio" size={24} strokeWidth={1.8} />
                  </div>
                  <p className="font-semibold text-ink-800">음성 분석을 시작할 준비가 됐습니다</p>
                  <p className="text-[12px] text-ink-500 mt-1">평균 2–3분 소요됩니다</p>
                  <button
                    onClick={handleStartAnalysis}
                    disabled={startingAnalysis}
                    className="mt-6 px-6 py-2.5 bg-brand-700 text-white rounded-full text-[13px] font-semibold hover:bg-brand-900 transition-colors disabled:opacity-60 disabled:cursor-wait"
                  >
                    {startingAnalysis ? '요청 중…' : '분석 시작'}
                  </button>
                </>
              ) : analysisStatus === 'FAILED' ? (
                <>
                  <p className="font-semibold text-red-600">분석에 실패했습니다</p>
                  <p className="text-[12px] text-ink-500 mt-1">오류가 발생했습니다. 다시 시도해주세요.</p>
                  <button
                    onClick={handleStartAnalysis}
                    disabled={startingAnalysis}
                    className="mt-6 px-6 py-2.5 bg-red-600 text-white rounded-full text-[13px] font-semibold hover:bg-red-700"
                  >
                    다시 시도
                  </button>
                </>
              ) : (
                <>
                  <div
                    className="w-16 h-16 rounded-full border-4 border-brand-200 border-t-brand-700 mx-auto mb-4"
                    style={{ animation: 'spin 1s linear infinite' }}
                  />
                  <p className="font-semibold text-ink-800">음성을 분석하고 있습니다</p>
                  <p className="text-[12px] text-ink-500 mt-1">
                    상태: {analysisStatus ?? '확인 중…'} · 5초마다 갱신됩니다
                  </p>
                </>
              )}
            </div>
          </div>
        )}

        {/* ── Step 3: Transcript ───────────────────────────────────────────── */}
        {step === 3 && (
          <>
            <div className="bg-white rounded-xl border border-ink-200 shadow-sm">
              <div className="flex items-center justify-between px-6 py-4 border-b border-ink-100">
                <p className="text-[16px] font-semibold text-ink-800">전사 검토</p>
                <button
                  onClick={handleConfirmTranscript}
                  disabled={confirming || transcriptLoading || !transcript}
                  className="flex items-center gap-1.5 px-4 py-2 bg-brand-700 text-white rounded-full text-[13px] font-semibold hover:bg-brand-900 transition-colors disabled:opacity-60 disabled:cursor-wait"
                >
                  <Icon name="chevronRight" size={14} />
                  {confirming ? '처리 중…' : '전사 확인 및 리포트 생성'}
                </button>
              </div>

              <div className="p-6">
                {transcriptLoading ? (
                  <div className="text-center py-8 text-ink-400 text-[13px]">전사를 불러오는 중…</div>
                ) : !transcript || transcript.segments.length === 0 ? (
                  <div className="text-center py-8 text-ink-400 text-[13px]">전사 데이터가 없습니다.</div>
                ) : (
                  <div className="flex flex-col gap-3">
                    {transcript.segments.map((seg) => {
                      const role = (seg.speaker_role ?? 'UNKNOWN') as keyof typeof speakerMap
                      const sp = speakerMap[role] ?? speakerMap.UNKNOWN
                      const displayText = seg.final_text ?? seg.edited_text ?? seg.original_text ?? ''
                      const isEditing = editingSegId === seg.id
                      const isDropdownOpen = speakerDropdownId === seg.id
                      const isUpdatingSpeaker = updatingSpeakerId === seg.id

                      return (
                        <div key={seg.id} className="flex gap-3 items-start">
                          {/* Timestamp */}
                          <span className="text-[11px] font-mono text-ink-400 pt-1 w-14 flex-shrink-0">
                            {seg.start_time != null
                              ? `${String(Math.floor(seg.start_time / 60)).padStart(2, '0')}:${String(Math.floor(seg.start_time % 60)).padStart(2, '0')}`
                              : '—'}
                          </span>

                          {/* Speaker badge — clickable dropdown */}
                          <div className="relative flex-shrink-0">
                            <button
                              disabled={isUpdatingSpeaker}
                              onClick={() => setSpeakerDropdownId(isDropdownOpen ? null : seg.id)}
                              className={cn(
                                'text-[11px] font-semibold px-2 py-0.5 rounded-md transition-opacity flex items-center gap-1',
                                sp.bg, sp.fg,
                                isUpdatingSpeaker ? 'opacity-50 cursor-wait' : 'hover:opacity-80 cursor-pointer',
                              )}
                            >
                              {isUpdatingSpeaker ? '…' : sp.label}
                              {!isUpdatingSpeaker && (
                                <svg width="8" height="8" viewBox="0 0 10 10" fill="currentColor">
                                  <path d="M5 7L1 3h8z" />
                                </svg>
                              )}
                            </button>

                            {isDropdownOpen && (
                              <>
                                {/* Backdrop */}
                                <div
                                  className="fixed inset-0 z-10"
                                  onClick={() => setSpeakerDropdownId(null)}
                                />
                                <div className="absolute left-0 top-full mt-1 z-20 bg-white border border-ink-200 rounded-lg shadow-lg py-1 min-w-[96px]">
                                  {(
                                    [
                                      { value: 'CHILD',     label: '아동',   bg: 'bg-brand-100', fg: 'text-brand-700' },
                                      { value: 'THERAPIST', label: '치료사', bg: 'bg-blue-100',  fg: 'text-blue-700' },
                                      { value: 'UNKNOWN',   label: '미상',   bg: 'bg-ink-100',   fg: 'text-ink-600' },
                                    ] as const
                                  ).map((opt) => (
                                    <button
                                      key={opt.value}
                                      onClick={() => handleSpeakerChange(seg.id, opt.value)}
                                      className={cn(
                                        'w-full text-left px-3 py-1.5 text-[12px] font-semibold flex items-center gap-2 hover:bg-ink-50 transition-colors',
                                        role === opt.value ? 'opacity-40 cursor-default' : '',
                                      )}
                                    >
                                      <span className={cn('w-2 h-2 rounded-full', opt.bg)} />
                                      <span className={opt.fg}>{opt.label}</span>
                                      {role === opt.value && (
                                        <Icon name="check" size={11} strokeWidth={2.5} className="ml-auto text-ink-400" />
                                      )}
                                    </button>
                                  ))}
                                </div>
                              </>
                            )}
                          </div>

                          {/* Text */}
                          <div className="flex-1">
                            {isEditing ? (
                              <div className="flex gap-2 items-center">
                                <input
                                  autoFocus
                                  value={editText}
                                  onChange={(e) => setEditText(e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleEditSave(seg.id, displayText)
                                    if (e.key === 'Escape') setEditingSegId(null)
                                  }}
                                  onBlur={() => handleEditSave(seg.id, displayText)}
                                  className="flex-1 text-[13px] border border-brand-400 rounded-md px-2 py-0.5 outline-none font-sans"
                                />
                                <span className="text-[10px] text-ink-400">Enter 저장 · Esc 취소</span>
                              </div>
                            ) : (
                              <p
                                className={cn(
                                  'text-[13px] leading-relaxed cursor-text hover:bg-brand-25 rounded px-1 -ml-1',
                                  seg.edited_text ? 'text-brand-700' : 'text-ink-700',
                                )}
                                onClick={() => handleEditStart(seg.id, displayText)}
                                title="클릭하여 편집"
                              >
                                {displayText}
                              </p>
                            )}
                          </div>

                          {/* Edit indicator */}
                          {seg.edited_text && !isEditing && (
                            <span className="text-[10px] text-brand-500 font-semibold mt-1 flex-shrink-0">수정됨</span>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* ── Step 4: Metrics ──────────────────────────────────────────────── */}
        {step === 4 && (() => {
          const speakers: any[] = (analysisResult?.metrics_json as any)?.speakers ?? []
          const child = speakers.find((s: any) => s.speaker_role === 'CHILD')
          const m = child?.metrics
          if (!m) return null

          const cards = [
            {
              label: 'MLU',
              sublabel: '평균 발화 길이 (형태소)',
              value: m.mlu_morpheme != null ? m.mlu_morpheme.toFixed(2) : '—',
              unit: '형태소/발화',
            },
            {
              label: 'NTW',
              sublabel: '총 발화 단어 수',
              value: m.ntw != null ? String(m.ntw) : '—',
              unit: '단어',
            },
            {
              label: 'TTR',
              sublabel: '어휘 다양도',
              value: m.ttr != null ? (m.ttr * 100).toFixed(1) + '%' : '—',
              unit: 'NDW / NTW',
            },
            {
              label: '반응 지연',
              sublabel: '치료사 발화 후 아동 응답',
              value: m.average_response_latency_sec != null
                ? m.average_response_latency_sec.toFixed(2)
                : '—',
              unit: '초',
            },
          ]

          return (
            <div className="bg-white rounded-xl border border-ink-200 shadow-sm p-5">
              <p className="text-[14px] font-semibold text-ink-800 mb-4">아동 언어 지표</p>
              <div className="grid grid-cols-4 gap-3">
                {cards.map((c) => (
                  <div key={c.label} className="bg-brand-50 rounded-xl p-4">
                    <p className="text-[11px] font-bold text-brand-700 uppercase tracking-wide">{c.label}</p>
                    <p className="text-[22px] font-bold text-ink-800 font-mono-num mt-1">{c.value}</p>
                    <p className="text-[11px] text-ink-500 mt-0.5">{c.unit}</p>
                    <p className="text-[10px] text-ink-400 mt-1">{c.sublabel}</p>
                  </div>
                ))}
              </div>
              {m.warnings?.length > 0 && (
                <p className="text-[11px] text-amber-600 mt-3">
                  ⚠ {m.warnings.join(' · ')}
                </p>
              )}
            </div>
          )
        })()}

        {/* ── Step 4: SOAP Note ────────────────────────────────────────────── */}
        {step === 4 && (
          <div className="bg-white rounded-xl border border-ink-200 shadow-sm">
            <div className="flex items-center justify-between px-6 py-4 border-b border-ink-100">
              <p className="text-[16px] font-semibold text-ink-800">SOAP Note</p>
              <button
                onClick={handleDownload}
                disabled={!report || downloading}
                className="flex items-center gap-1.5 px-4 py-2 bg-brand-700 text-white rounded-full text-[13px] font-semibold hover:bg-brand-900 transition-colors disabled:opacity-50 disabled:cursor-wait"
              >
                <Icon name="download" size={14} />
                {downloading ? '다운로드 중…' : report ? '리포트 다운로드' : '리포트 없음'}
              </button>
            </div>
            <div className="p-6">
              {soapLoading ? (
                <div className="text-center py-8 text-ink-400 text-[13px]">불러오는 중…</div>
              ) : soapNote ? (
                <div className="grid grid-cols-2 gap-4">
                  {([
                    { key: 'S', label: 'Subjective — 주관적 정보', value: soapNote.subjective },
                    { key: 'O', label: 'Objective — 객관적 정보',  value: soapNote.objective  },
                    { key: 'A', label: 'Assessment — 평가',        value: soapNote.assessment  },
                    { key: 'P', label: 'Plan — 계획',              value: soapNote.plan        },
                  ] as const).map(({ key, label, value }) => (
                    <div key={key} className="bg-ink-50 rounded-xl p-4">
                      <p className="text-[11px] font-bold text-brand-700 uppercase tracking-wide mb-1.5">{label}</p>
                      <p className="text-[13px] text-ink-700 leading-relaxed">{value ?? '—'}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-ink-400 text-[13px]">SOAP 노트가 없습니다.</div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
