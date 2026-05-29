import { useNavigate } from 'react-router-dom'
import { StatusBadge } from '@/components/common/StatusBadge'
import { Icon } from '@/components/common/Icon'
import { useAuthStore } from '@/store/authStore'
import { cn } from '@/lib/utils'

const MOCK_STATS = [
  { id: 'children', label: '담당 아동',    value: 14, delta: '+2 이번 달',      tone: 'pos' },
  { id: 'sessions', label: '이번 달 세션', value: 38, delta: '+12 vs 지난달',   tone: 'pos' },
  { id: 'queue',    label: '분석 대기',    value: 3,  delta: '평균 2분 12초', tone: 'neutral' },
]

const MOCK_SESSIONS = [
  { id: 24, child: '박서윤', age: '6세 2개월',  date: '2026.05.28', time: '14:00', kind: '개별', status: 'ANALYSIS_COMPLETED' as const, mlu: 4.27 },
  { id: 23, child: '이하준', age: '5세 8개월',  date: '2026.05.28', time: '11:30', kind: '개별', status: 'ANALYSIS_PROCESSING' as const, mlu: null },
  { id: 22, child: '최예나', age: '4세 11개월', date: '2026.05.27', time: '16:00', kind: '그룹', status: 'REPORT_READY'         as const, mlu: 3.91 },
  { id: 21, child: '정도윤', age: '7세 1개월',  date: '2026.05.27', time: '13:00', kind: '개별', status: 'FAILED'               as const, mlu: null },
  { id: 20, child: '강하린', age: '5세 4개월',  date: '2026.05.26', time: '15:30', kind: '개별', status: 'AUDIO_UPLOADED'       as const, mlu: null },
]

function StatCard({ label, value, delta, tone }: typeof MOCK_STATS[0]) {
  return (
    <div className="bg-white rounded-xl border border-ink-200 shadow-sm p-5 flex flex-col gap-2">
      <p className="text-[12px] font-semibold text-ink-500 uppercase tracking-wide">{label}</p>
      <p className="text-3xl font-bold text-ink-800 font-mono-num">{value}</p>
      <p className={cn('text-[12px] font-medium', tone === 'pos' ? 'text-brand-500' : 'text-ink-400')}>
        {delta}
      </p>
    </div>
  )
}

export default function DashboardPage() {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)

  // In production this would use: useQuery({ queryKey: ['sessions'], queryFn: () => sessionsApi.list() })
  const sessions = MOCK_SESSIONS

  return (
    <div>
      {/* Header */}
      <div className="px-8 pt-7 pb-5 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink-800 tracking-tight">대시보드</h1>
          <p className="text-[13px] text-ink-500 mt-1">
            안녕하세요, {user?.name ?? '선생님'}. 오늘도 좋은 하루 되세요.
          </p>
        </div>
        <button
          onClick={() => navigate('/sessions/new')}
          className="flex items-center gap-2 px-4 py-2 bg-brand-700 text-white rounded-full text-[13px] font-semibold hover:bg-brand-900 transition-colors shadow-md"
        >
          <Icon name="plus" size={15} />새 세션
        </button>
      </div>

      <div className="px-8 pb-8 flex flex-col gap-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {MOCK_STATS.map((s) => <StatCard key={s.id} {...s} />)}
        </div>

        {/* Recent sessions */}
        <div className="bg-white rounded-xl border border-ink-200 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-ink-100">
            <div>
              <h2 className="text-[15px] font-semibold text-ink-800">최근 세션</h2>
              <p className="text-[12px] text-ink-500 mt-0.5">최근 5개 세션을 표시합니다</p>
            </div>
            <button
              onClick={() => navigate('/sessions')}
              className="text-[12px] text-brand-600 font-semibold hover:text-brand-800 flex items-center gap-1"
            >
              전체 보기 <Icon name="chevronRight" size={13} strokeWidth={2.2} />
            </button>
          </div>

          <table className="w-full text-[13px]">
            <thead>
              <tr className="bg-ink-50 border-b border-ink-100">
                <th className="text-left px-5 py-2.5 text-[11px] font-semibold text-ink-500 uppercase tracking-wider">아동</th>
                <th className="text-left px-5 py-2.5 text-[11px] font-semibold text-ink-500 uppercase tracking-wider">일시</th>
                <th className="text-left px-5 py-2.5 text-[11px] font-semibold text-ink-500 uppercase tracking-wider">유형</th>
                <th className="text-left px-5 py-2.5 text-[11px] font-semibold text-ink-500 uppercase tracking-wider">상태</th>
                <th className="text-right px-5 py-2.5 text-[11px] font-semibold text-ink-500 uppercase tracking-wider">MLU</th>
              </tr>
            </thead>
            <tbody>
              {sessions.map((s) => (
                <tr
                  key={s.id}
                  onClick={() => navigate(`/sessions/${s.id}`)}
                  className="border-t border-ink-100 hover:bg-brand-25 cursor-pointer transition-colors"
                >
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-[13px] font-bold">
                        {s.child[0]}
                      </div>
                      <div>
                        <p className="font-semibold text-ink-800">{s.child}</p>
                        <p className="text-[11px] text-ink-500">{s.age}</p>
                      </div>
                    </div>
                  </td>
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
  )
}
