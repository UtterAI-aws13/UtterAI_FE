import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Icon } from '@/components/common/Icon'
import { useToast } from '@/hooks/useToast'
import { cn } from '@/lib/utils'
import type { SessionStatus } from '@/api/sessions'

// UI 전용 타입 — 나중에 BE 연동 시 transcript.ts / soapNotes.ts 타입으로 교체
type Utterance = { t: string; speaker: 'CHILD' | 'THERAPIST' | 'UNKNOWN'; text: string; edited?: boolean }
type Metric    = { label: string; desc: string; value: string; delta: string; dir: 'up' | 'down'; good: boolean }
type SoapNote  = { S: string; O: string; A: string; P: string }

type Step = 1 | 2 | 3 | 4

const MOCK_SESSION = {
  id: 24,
  child: '박서윤',
  age: '6세 2개월',
  date: '2026.05.28',
  time: '14:00',
  kind: '개별',
  status: 'ANALYSIS_COMPLETED' as SessionStatus,
  mlu: 4.27,
}

const MOCK_UTTERANCES: Utterance[] = [
  { t: '00:12.4', speaker: 'CHILD',     text: '오늘 어린이집에서 친구랑 같이 블록 놀이 했어요.' },
  { t: '00:18.1', speaker: 'THERAPIST', text: '어떤 블록을 만들었는지 더 자세히 얘기해줄래요?' },
  { t: '00:24.7', speaker: 'CHILD',     text: '큰… 차고지를 만들었어요 빨간색이랑 파란색이랑.', edited: true },
  { t: '00:29.0', speaker: 'UNKNOWN',   text: '(배경음 · 식별 불가)' },
  { t: '00:32.2', speaker: 'THERAPIST', text: '차가 몇 대나 들어갈 수 있는 큰 차고지였구나.' },
  { t: '00:38.9', speaker: 'CHILD',     text: '음… 다섯 대요. 아니 여섯 대.' },
]

const MOCK_METRICS: Metric[] = [
  { label: 'MLU',    desc: '평균 발화 길이',    value: '4.27', delta: '+0.34', dir: 'up',   good: true },
  { label: 'TTR',    desc: 'Type-Token Ratio', value: '0.62', delta: '−0.05', dir: 'down', good: false },
  { label: '발화 수', desc: 'Total utterances', value: '128',  delta: '+22',   dir: 'up',   good: true },
  { label: '어휘 수', desc: 'Unique words',     value: '79',   delta: '+9',    dir: 'up',   good: true },
]

const MOCK_SOAP: SoapNote = {
  S: '아동은 어린이집 친구와의 블록 놀이 경험을 자발적으로 보고하였으며, 감정 표현(슬픔)도 함께 표현하였습니다.',
  O: '60분 세션, MLU 4.27 (또래 평균 3.8–4.5 범위), TTR 0.62. 자발 발화 빈도 평소 대비 27% 증가.',
  A: '발화 길이와 어휘 다양도는 또래 평균 범위 내에서 안정적 발달을 보이고 있으나, 복문 사용 빈도는 다소 낮음.',
  P: '다음 세션에서 그림책 활용한 복문 산출 활동 진행. 보호자에게 가정 내 일상 대화에서 "왜냐하면", "그래서" 사용 모델링 안내.',
}

const STEPS = [
  { id: 1, label: '음성 업로드', sub: 'Upload' },
  { id: 2, label: 'AI 분석',    sub: 'Analyze' },
  { id: 3, label: '전사 검토',   sub: 'Review' },
  { id: 4, label: '리포트',      sub: 'Report' },
]

function statusToStep(s: SessionStatus): Step {
  if (s === 'CREATED') return 1
  if (s === 'AUDIO_UPLOADED' || s === 'ANALYSIS_PROCESSING' || s === 'FAILED') return 2
  if (s === 'ANALYSIS_COMPLETED') return 3
  return 4
}

const speakerMap = {
  CHILD:     { label: '아동',   bg: 'bg-brand-100', fg: 'text-brand-700' },
  THERAPIST: { label: '치료사', bg: 'bg-blue-100',  fg: 'text-blue-700' },
  UNKNOWN:   { label: '미상',   bg: 'bg-ink-100',   fg: 'text-ink-600' },
}

export default function SessionDetailPage() {
  const { id: _id } = useParams()
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [step, setStep] = useState<Step>(statusToStep(MOCK_SESSION.status))

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
            세션 #{MOCK_SESSION.id} — {MOCK_SESSION.child}
          </h1>
          <p className="text-[13px] text-ink-500 mt-0.5">
            {MOCK_SESSION.date} {MOCK_SESSION.time} · {MOCK_SESSION.kind} · {MOCK_SESSION.age}
          </p>
        </div>
      </div>

      <div className="px-8 pb-8 flex flex-col gap-5">
        {/* Stepper */}
        <div className="bg-white rounded-xl border border-ink-200 shadow-sm p-6">
          <div className="flex items-center">
            {STEPS.map((s, i) => {
              const done    = step > s.id
              const active  = step === s.id
              return (
                <div key={s.id} className="flex items-center flex-1 last:flex-none">
                  <div className="flex flex-col items-center gap-2 cursor-pointer" onClick={() => { if (done) setStep(s.id as Step) }}>
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

        {/* Step content */}
        {step === 1 && (
          <div className="bg-white rounded-xl border border-ink-200 shadow-sm">
            <div className="px-6 py-4 border-b border-ink-100">
              <p className="text-[16px] font-semibold text-ink-800">음성 파일 업로드</p>
            </div>
            <div className="p-6">
              <div className="border-2 border-dashed border-ink-200 rounded-xl p-10 text-center hover:border-brand-400 transition-colors cursor-pointer"
                onClick={() => { setStep(2); showToast({ title: '음성 파일이 업로드되었습니다', kind: 'success' }) }}>
                <div className="w-14 h-14 rounded-xl bg-brand-50 flex items-center justify-center text-brand-600 mx-auto mb-3">
                  <Icon name="upload" size={24} strokeWidth={1.8} />
                </div>
                <p className="font-semibold text-ink-800">파일을 드래그하거나 클릭해서 업로드</p>
                <p className="text-[12px] text-ink-500 mt-1">WAV, MP3, M4A · 최대 500MB</p>
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="bg-white rounded-xl border border-ink-200 shadow-sm">
            <div className="px-6 py-4 border-b border-ink-100">
              <p className="text-[16px] font-semibold text-ink-800">AI 분석 중</p>
            </div>
            <div className="p-6 text-center">
              <div className="w-16 h-16 rounded-full border-4 border-brand-200 border-t-brand-700 mx-auto mb-4"
                style={{ animation: 'spin 1s linear infinite' }} />
              <p className="font-semibold text-ink-800">음성을 분석하고 있습니다</p>
              <p className="text-[12px] text-ink-500 mt-1">평균 2–3분 소요됩니다</p>
              <button
                onClick={() => { setStep(3); showToast({ title: '분석이 완료되었습니다', kind: 'success' }) }}
                className="mt-6 px-4 py-2 bg-brand-50 text-brand-700 rounded-lg text-[13px] font-semibold hover:bg-brand-100 transition-colors"
              >
                (데모) 분석 완료로 이동
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <>
            {/* Metrics */}
            <div className="grid grid-cols-4 gap-4">
              {MOCK_METRICS.map((m) => (
                <div key={m.label} className="bg-white rounded-xl border border-ink-200 shadow-sm p-4">
                  <p className="text-[11px] font-semibold text-ink-500 uppercase tracking-wide">{m.label}</p>
                  <p className="text-[10px] text-ink-400 mb-2">{m.desc}</p>
                  <p className="text-2xl font-bold text-ink-800 font-mono-num">{m.value}</p>
                  <p className={cn('text-[11px] font-semibold mt-1', m.good ? 'text-brand-500' : 'text-red-500')}>
                    {m.dir === 'up' ? '▲' : '▼'} {m.delta}
                  </p>
                </div>
              ))}
            </div>

            {/* Transcript */}
            <div className="bg-white rounded-xl border border-ink-200 shadow-sm">
              <div className="flex items-center justify-between px-6 py-4 border-b border-ink-100">
                <p className="text-[16px] font-semibold text-ink-800">전사 검토</p>
                <button
                  onClick={() => { setStep(4); showToast({ title: '전사가 저장되었습니다', kind: 'success' }) }}
                  className="flex items-center gap-1.5 px-4 py-2 bg-brand-700 text-white rounded-full text-[13px] font-semibold hover:bg-brand-900 transition-colors"
                >
                  <Icon name="chevronRight" size={14} />리포트 보기
                </button>
              </div>
              <div className="p-6 flex flex-col gap-3">
                {MOCK_UTTERANCES.map((u, i) => {
                  const s = speakerMap[u.speaker]
                  return (
                    <div key={i} className="flex gap-3 items-start">
                      <span className="text-[11px] font-mono text-ink-400 pt-0.5 w-14 flex-shrink-0">{u.t}</span>
                      <span className={cn('text-[11px] font-semibold px-2 py-0.5 rounded-md flex-shrink-0', s.bg, s.fg)}>
                        {s.label}
                      </span>
                      <p className={cn('text-[13px] leading-relaxed', u.edited ? 'text-brand-700' : 'text-ink-700')}>
                        {u.text}
                      </p>
                      {u.edited && (
                        <span className="text-[10px] text-brand-500 font-semibold mt-0.5 flex-shrink-0">수정됨</span>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          </>
        )}

        {step === 4 && (
          <div className="bg-white rounded-xl border border-ink-200 shadow-sm">
            <div className="flex items-center justify-between px-6 py-4 border-b border-ink-100">
              <p className="text-[16px] font-semibold text-ink-800">SOAP Note</p>
              <button className="flex items-center gap-1.5 px-4 py-2 bg-brand-700 text-white rounded-full text-[13px] font-semibold hover:bg-brand-900 transition-colors">
                <Icon name="download" size={14} />PDF 다운로드
              </button>
            </div>
            <div className="p-6 grid grid-cols-2 gap-4">
              {(Object.entries(MOCK_SOAP) as [keyof SoapNote, string][]).map(([key, val]) => {
                const labels: Record<keyof SoapNote, string> = {
                  S: 'Subjective — 주관적 정보',
                  O: 'Objective — 객관적 정보',
                  A: 'Assessment — 평가',
                  P: 'Plan — 계획',
                }
                return (
                  <div key={key} className="bg-ink-50 rounded-xl p-4">
                    <p className="text-[11px] font-bold text-brand-700 uppercase tracking-wide mb-1.5">{labels[key]}</p>
                    <p className="text-[13px] text-ink-700 leading-relaxed">{val}</p>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
