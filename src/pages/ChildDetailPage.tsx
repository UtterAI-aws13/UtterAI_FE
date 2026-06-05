import { useParams, useNavigate } from 'react-router-dom'
import { StatusBadge } from '@/components/common/StatusBadge'
import { Icon } from '@/components/common/Icon'
import { cn } from '@/lib/utils'
import type { SessionStatus } from '@/api/sessions'

const MOCK_CHILD = {
  id: 1, name: '박서윤', dob: '2020.04.15', age: '6세 2개월', gender: 'F' as const,
  registered: '2024.10.02', sessions: 24, lastSession: '2026.05.28',
  primaryGoal: '표현언어 지연',
  notes: '보호자 보고 기준 가정에서 또래보다 발화량이 적으나, 이해 언어는 정상 범위',
}

const MOCK_SESSIONS = [
  { id: 24, date: '2026.05.28', time: '14:00', kind: '개별', status: 'ANALYSIS_COMPLETED' as SessionStatus, mlu: 4.27 },
  { id: 23, date: '2026.05.21', time: '14:00', kind: '개별', status: 'REPORT_READY'         as SessionStatus, mlu: 3.95 },
  { id: 22, date: '2026.05.14', time: '14:00', kind: '개별', status: 'REPORT_READY'         as SessionStatus, mlu: 3.72 },
]

const METRIC_HISTORY = [
  { date: '05.14', mlu: 3.72 },
  { date: '05.21', mlu: 3.95 },
  { date: '05.28', mlu: 4.27 },
]

export default function ChildDetailPage() {
  const { id: _id } = useParams()
  const navigate = useNavigate()
  const child = MOCK_CHILD

  const genderLabel = child.gender === 'F' ? '여아' : child.gender === 'M' ? '남아' : '미입력'

  return (
    <div>
      {/* Header */}
      <div className="px-8 pt-7 pb-5 flex items-center gap-4">
        <button
          onClick={() => navigate('/children')}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-ink-500 hover:bg-ink-100 transition-colors"
        >
          <Icon name="arrowLeft" size={16} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-ink-800 tracking-tight">{child.name}</h1>
          <p className="text-[13px] text-ink-500 mt-0.5">{child.age} · {genderLabel} · 등록일 {child.registered}</p>
        </div>
      </div>

      <div className="px-8 pb-8 grid grid-cols-3 gap-5">
        {/* Left: Info card */}
        <div className="col-span-1 flex flex-col gap-4">
          <div className="bg-white rounded-xl border border-ink-200 shadow-sm p-5">
            <div className="flex items-center gap-3 mb-4 pb-4 border-b border-ink-100">
              <div className={cn(
                'w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold',
                child.gender === 'F' ? 'bg-pink-100 text-pink-700' : 'bg-blue-100 text-blue-700',
              )}>
                {child.name[0]}
              </div>
              <div>
                <p className="font-bold text-[16px] text-ink-800">{child.name}</p>
                <p className="text-[12px] text-ink-500">{child.dob}</p>
              </div>
            </div>
            <div className="flex flex-col gap-3">
              {[
                { label: '주 치료 목표', value: child.primaryGoal },
                { label: '전체 세션',    value: `${child.sessions}회` },
                { label: '최근 세션',    value: child.lastSession },
              ].map((r) => (
                <div key={r.label} className="flex justify-between items-start">
                  <span className="text-[12px] text-ink-500">{r.label}</span>
                  <span className="text-[12px] font-semibold text-ink-800 text-right ml-4">{r.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Notes card */}
          <div className="bg-white rounded-xl border border-ink-200 shadow-sm p-5">
            <p className="text-[13px] font-semibold text-ink-800 mb-2">초기 관찰 노트</p>
            <p className="text-[12px] text-ink-500 leading-relaxed">{child.notes}</p>
          </div>

          {/* MLU trend */}
          <div className="bg-white rounded-xl border border-ink-200 shadow-sm p-5">
            <p className="text-[13px] font-semibold text-ink-800 mb-3">MLU 추이</p>
            <div className="flex items-end gap-3 h-16">
              {METRIC_HISTORY.map((m, i) => {
                const maxH = 64
                const minMlu = 3.5
                const range = 1.0
                const pct = (m.mlu - minMlu) / range
                const barH = Math.round(pct * maxH)
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <p className="text-[10px] font-mono text-ink-500">{m.mlu.toFixed(2)}</p>
                    <div
                      className="w-full rounded-t bg-brand-200 transition-all"
                      style={{ height: barH }}
                    />
                    <p className="text-[10px] text-ink-400">{m.date}</p>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Right: Session list */}
        <div className="col-span-2">
          <div className="bg-white rounded-xl border border-ink-200 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-ink-100">
              <h2 className="text-[15px] font-semibold text-ink-800">세션 기록</h2>
              <button
                onClick={() => navigate('/sessions')}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-700 text-white rounded-full text-[12px] font-semibold hover:bg-brand-900 transition-colors"
              >
                <Icon name="plus" size={13} />새 세션
              </button>
            </div>
            <table className="w-full text-[13px]">
              <thead>
                <tr className="bg-ink-50 border-b border-ink-100">
                  <th className="text-left px-5 py-2.5 text-[11px] font-semibold text-ink-500 uppercase tracking-wider">일시</th>
                  <th className="text-left px-5 py-2.5 text-[11px] font-semibold text-ink-500 uppercase tracking-wider">유형</th>
                  <th className="text-left px-5 py-2.5 text-[11px] font-semibold text-ink-500 uppercase tracking-wider">상태</th>
                  <th className="text-right px-5 py-2.5 text-[11px] font-semibold text-ink-500 uppercase tracking-wider">MLU</th>
                </tr>
              </thead>
              <tbody>
                {MOCK_SESSIONS.map((s) => (
                  <tr
                    key={s.id}
                    onClick={() => navigate(`/sessions/${s.id}`)}
                    className="border-t border-ink-100 hover:bg-brand-25 cursor-pointer transition-colors"
                  >
                    <td className="px-5 py-3 font-mono-num text-ink-500">{s.date} {s.time}</td>
                    <td className="px-5 py-3">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-ink-100 text-ink-600">
                        {s.kind}
                      </span>
                    </td>
                    <td className="px-5 py-3"><StatusBadge status={s.status} /></td>
                    <td className="px-5 py-3 text-right font-mono-num font-semibold text-ink-800">
                      {s.mlu != null ? s.mlu.toFixed(2) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
