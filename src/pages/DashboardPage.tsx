import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { StatusBadge } from '@/components/common/StatusBadge'
import { Icon } from '@/components/common/Icon'
import { useAuthStore } from '@/store/authStore'
import { cn } from '@/lib/utils'
import { sessionsApi } from '@/api/sessions'
import { childrenApi } from '@/api/children'

function fmtDate(d: string) {
  return d.slice(0, 10).replaceAll('-', '.')
}

const SESSION_TYPE_LABEL: Record<string, string> = { INDIVIDUAL: '개별', GROUP: '그룹' }

function StatCard({ label, value, delta, tone }: { label: string; value: number; delta: string; tone: string }) {
  return (
    <div className="bg-white rounded-xl border border-ink-200 shadow-sm p-5 flex flex-col gap-2">
      <p className="text-[12px] font-semibold text-ink-500 uppercase tracking-wide">{label}</p>
      <p className="text-3xl font-bold text-ink-800 font-mono-num">{value}</p>
      <p className={cn('text-[12px] font-medium', tone === 'pos' ? 'text-brand-500' : 'text-ink-400')}>{delta}</p>
    </div>
  )
}

export default function DashboardPage() {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)

  const { data: sessions = [] } = useQuery({
    queryKey: ['sessions'],
    queryFn: () => sessionsApi.list().then((r) => r.data),
  })

  const { data: children = [] } = useQuery({
    queryKey: ['children'],
    queryFn: () => childrenApi.list().then((r) => r.data),
  })

  const childMap = Object.fromEntries(children.map((c) => [c.id, c]))
  const thisMonth = new Date().toISOString().slice(0, 7)
  const sessionsThisMonth = sessions.filter((s) => s.created_at.startsWith(thisMonth)).length
  const analysisQueue = sessions.filter((s) =>
    s.status === 'ANALYSIS_REQUESTED' || s.status === 'ANALYSIS_PROCESSING',
  ).length
  const recentSessions = sessions.slice(0, 5)

  const stats = [
    { id: 'children', label: '담당 아동',    value: children.length,    delta: `총 ${children.length}명`,         tone: 'pos' },
    { id: 'sessions', label: '이번 달 세션', value: sessionsThisMonth,  delta: `전체 ${sessions.length}개 세션`,  tone: 'pos' },
    { id: 'queue',    label: '분석 진행 중', value: analysisQueue,       delta: '분석 대기 세션',                  tone: 'neutral' },
  ]

  return (
    <div>
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
        <div className="grid grid-cols-3 gap-4">
          {stats.map((s) => <StatCard key={s.id} {...s} />)}
        </div>

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

          {recentSessions.length === 0 ? (
            <div className="py-12 text-center text-ink-400 text-[13px]">세션이 없습니다.</div>
          ) : (
            <table className="w-full text-[13px]">
              <thead>
                <tr className="bg-ink-50 border-b border-ink-100">
                  {['아동', '날짜', '유형', '상태'].map((h) => (
                    <th key={h} className="py-2.5 px-5 text-[11px] font-semibold text-ink-500 uppercase tracking-wider text-left">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentSessions.map((s) => {
                  const child = childMap[s.child_id]
                  return (
                    <tr
                      key={s.id}
                      onClick={() => navigate(`/sessions/${s.id}`)}
                      className="border-t border-ink-100 hover:bg-brand-25 cursor-pointer transition-colors"
                    >
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-[13px] font-bold">
                            {child ? child.name[0] : '?'}
                          </div>
                          <p className="font-semibold text-ink-800">{child?.name ?? '—'}</p>
                        </div>
                      </td>
                      <td className="px-5 py-3 font-mono-num text-ink-500">{fmtDate(s.session_date)}</td>
                      <td className="px-5 py-3">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-ink-100 text-ink-600">
                          {SESSION_TYPE_LABEL[s.session_type ?? ''] ?? s.session_type ?? '—'}
                        </span>
                      </td>
                      <td className="px-5 py-3"><StatusBadge status={s.status} /></td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}
