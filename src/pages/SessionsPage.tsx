import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { StatusBadge } from '@/components/common/StatusBadge'
import { Icon } from '@/components/common/Icon'
import { cn } from '@/lib/utils'
import { sessionsApi, type SessionStatus } from '@/api/sessions'
import { childrenApi } from '@/api/children'

const SESSION_TYPE_LABEL: Record<string, string> = { INDIVIDUAL: '개별', GROUP: '그룹' }

function fmtDate(iso: string) {
  return iso.slice(0, 10).replaceAll('-', '.')
}

const STATUS_FILTERS: Array<{ label: string; value: SessionStatus | 'all' }> = [
  { label: '전체',     value: 'all' },
  { label: '분석 완료', value: 'ANALYSIS_COMPLETED' },
  { label: '분석 중',  value: 'ANALYSIS_PROCESSING' },
  { label: '리포트',   value: 'REPORT_READY' },
  { label: '실패',     value: 'FAILED' },
]

export default function SessionsPage() {
  const navigate = useNavigate()
  const [statusFilter, setStatusFilter] = useState<SessionStatus | 'all'>('all')
  const [query, setQuery] = useState('')

  const { data: sessions = [], isLoading: sessionsLoading } = useQuery({
    queryKey: ['sessions'],
    queryFn: () => sessionsApi.list().then((r) => r.data),
  })

  const { data: children = [] } = useQuery({
    queryKey: ['children'],
    queryFn: () => childrenApi.list().then((r) => r.data),
  })

  const childMap = Object.fromEntries(children.map((c) => [c.id, c]))

  const filtered = sessions.filter((s) => {
    if (s.status === 'DELETED') return false
    if (statusFilter !== 'all' && s.status !== statusFilter) return false
    if (query) {
      const child = childMap[s.child_id]
      if (!child?.name.includes(query)) return false
    }
    return true
  })

  return (
    <div>
      <div className="px-8 pt-7 pb-5 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink-800 tracking-tight">세션 관리</h1>
          <p className="text-[13px] text-ink-500 mt-1">총 {filtered.length}개 세션</p>
        </div>
        <button
          onClick={() => navigate('/sessions/new')}
          className="flex items-center gap-2 px-4 py-2 bg-brand-700 text-white rounded-full text-[13px] font-semibold hover:bg-brand-900 transition-colors shadow-md"
        >
          <Icon name="plus" size={15} />새 세션
        </button>
      </div>

      <div className="px-8 pb-8">
        <div className="bg-white rounded-xl border border-ink-200 shadow-sm overflow-hidden">
          <div className="flex items-center gap-3 px-5 py-3.5 border-b border-ink-100 flex-wrap">
            <div className="relative">
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-400 pointer-events-none">
                <Icon name="search" size={14} />
              </span>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="아동 이름 검색…"
                className="h-9 pl-8 pr-3 w-[220px] border border-ink-200 rounded-lg text-[13px] outline-none focus:border-brand-500 font-sans"
              />
            </div>
            <div className="flex gap-1.5 ml-auto flex-wrap">
              {STATUS_FILTERS.map((f) => (
                <button
                  key={f.value}
                  onClick={() => setStatusFilter(f.value)}
                  className={cn(
                    'px-3 py-1.5 rounded-full text-[12px] font-medium border transition-all',
                    statusFilter === f.value
                      ? 'bg-brand-700 text-white border-brand-700'
                      : 'bg-transparent text-ink-600 border-ink-200 hover:bg-ink-50',
                  )}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {sessionsLoading ? (
            <div className="py-16 text-center text-ink-400 text-[13px]">불러오는 중…</div>
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center">
              <div className="w-16 h-16 rounded-2xl bg-brand-50 flex items-center justify-center text-brand-600 mx-auto mb-4">
                <Icon name="audio" size={28} strokeWidth={1.8} />
              </div>
              <p className="text-[15px] font-semibold text-ink-800">세션이 없습니다</p>
              <p className="text-[12px] text-ink-500 mt-1.5">필터를 변경하거나 새 세션을 생성해보세요.</p>
            </div>
          ) : (
            <table className="w-full text-[13px] border-collapse">
              <thead>
                <tr className="bg-ink-50">
                  {['아동', '날짜', '유형', '상태', ''].map((h, i) => (
                    <th key={i} className={cn(
                      'py-2.5 px-5 text-[11px] font-semibold text-ink-500 uppercase tracking-wider border-b border-ink-100',
                      'text-left',
                    )}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((s) => {
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
                      <td className="px-5 py-3 text-right">
                        <Icon name="chevronRight" size={14} strokeWidth={2.2} className="text-ink-400" />
                      </td>
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
