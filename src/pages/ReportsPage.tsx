import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Icon } from '@/components/common/Icon'
import { cn } from '@/lib/utils'
import { reportsApi, type ReportStatus } from '@/api/reports'
import { sessionsApi } from '@/api/sessions'
import { childrenApi } from '@/api/children'

function fmtDate(iso: string) {
  return iso.slice(0, 10).replaceAll('-', '.')
}

const STATUS_LABEL: Record<ReportStatus, string> = {
  READY:        '발행됨',
  REGENERATING: '재생성 중',
  DELETED:      '삭제됨',
}

function statusChipClass(s: ReportStatus) {
  return cn(
    'inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold',
    s === 'READY'        ? 'bg-green-100 text-green-700' :
    s === 'REGENERATING' ? 'bg-amber-100 text-amber-700' :
                           'bg-ink-100 text-ink-500',
  )
}

export default function ReportsPage() {
  const navigate = useNavigate()

  const { data: reports = [], isLoading } = useQuery({
    queryKey: ['reports'],
    queryFn: () => reportsApi.list().then((r) => r.data),
  })

  const { data: sessions = [] } = useQuery({
    queryKey: ['sessions'],
    queryFn: () => sessionsApi.list().then((r) => r.data),
  })

  const { data: children = [] } = useQuery({
    queryKey: ['children'],
    queryFn: () => childrenApi.list().then((r) => r.data),
  })

  const sessionMap = Object.fromEntries(sessions.map((s) => [s.id, s]))
  const childMap = Object.fromEntries(children.map((c) => [c.id, c]))

  const visible = reports.filter((r) => r.status !== 'DELETED')

  return (
    <div>
      <div className="px-8 pt-7 pb-5">
        <h1 className="text-2xl font-bold text-ink-800 tracking-tight">리포트</h1>
        <p className="text-[13px] text-ink-500 mt-1">총 {visible.length}개 리포트</p>
      </div>

      <div className="px-8 pb-8">
        <div className="bg-white rounded-xl border border-ink-200 shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="py-16 text-center text-ink-400 text-[13px]">불러오는 중…</div>
          ) : visible.length === 0 ? (
            <div className="py-16 text-center">
              <div className="w-16 h-16 rounded-2xl bg-brand-50 flex items-center justify-center text-brand-600 mx-auto mb-4">
                <Icon name="fileText" size={28} strokeWidth={1.8} />
              </div>
              <p className="text-[15px] font-semibold text-ink-800">아직 리포트가 없습니다</p>
              <p className="text-[12px] text-ink-500 mt-1.5">세션 분석을 완료하면 리포트를 생성할 수 있어요.</p>
            </div>
          ) : (
            <table className="w-full text-[13px] border-collapse">
              <thead>
                <tr className="bg-ink-50 border-b border-ink-100">
                  {['아동', '제목', '날짜', '상태', ''].map((h, i) => (
                    <th
                      key={i}
                      className="py-2.5 px-5 text-[11px] font-semibold text-ink-500 uppercase tracking-wider text-left"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {visible.map((r) => {
                  const session = sessionMap[r.session_id]
                  const child = session ? childMap[session.child_id] : undefined
                  return (
                    <tr
                      key={r.id}
                      className="border-t border-ink-100 hover:bg-brand-25 transition-colors cursor-pointer"
                      onClick={() => navigate(`/sessions/${r.session_id}`)}
                    >
                      <td className="px-5 py-3 font-semibold text-ink-800">{child?.name ?? '—'}</td>
                      <td className="px-5 py-3 text-ink-700 max-w-[280px] truncate">{r.title}</td>
                      <td className="px-5 py-3 font-mono-num text-ink-500">{fmtDate(r.created_at)}</td>
                      <td className="px-5 py-3">
                        <span className={statusChipClass(r.status)}>{STATUS_LABEL[r.status]}</span>
                      </td>
                      <td className="px-5 py-3 text-right">
                        <button
                          onClick={(e) => { e.stopPropagation(); navigate(`/sessions/${r.session_id}`) }}
                          className="inline-flex items-center gap-1 text-[12px] text-brand-600 font-semibold hover:text-brand-800"
                        >
                          보기 <Icon name="chevronRight" size={12} strokeWidth={2.2} />
                        </button>
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
