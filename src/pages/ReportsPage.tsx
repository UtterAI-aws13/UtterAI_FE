import { useNavigate } from 'react-router-dom'
import { Icon } from '@/components/common/Icon'
import { cn } from '@/lib/utils'

const MOCK_REPORTS = [
  { id: 1, sessionId: 22, childName: '최예나', date: '2026.05.27', status: 'PUBLISHED' as const, mlu: 3.91 },
  { id: 2, sessionId: 19, childName: '윤시아', date: '2026.05.26', status: 'DRAFT'     as const, mlu: 4.12 },
  { id: 3, sessionId: 16, childName: '박서윤', date: '2026.05.21', status: 'PUBLISHED' as const, mlu: 3.95 },
  { id: 4, sessionId: 15, childName: '강하린', date: '2026.05.20', status: 'DRAFT'     as const, mlu: null },
]

export default function ReportsPage() {
  const navigate = useNavigate()

  return (
    <div>
      <div className="px-8 pt-7 pb-5">
        <h1 className="text-2xl font-bold text-ink-800 tracking-tight">리포트</h1>
        <p className="text-[13px] text-ink-500 mt-1">총 {MOCK_REPORTS.length}개 리포트</p>
      </div>

      <div className="px-8 pb-8">
        <div className="bg-white rounded-xl border border-ink-200 shadow-sm overflow-hidden">
          <table className="w-full text-[13px] border-collapse">
            <thead>
              <tr className="bg-ink-50 border-b border-ink-100">
                {['아동', '세션', '날짜', '상태', 'MLU', ''].map((h, i) => (
                  <th key={i} className={cn(
                    'py-2.5 px-5 text-[11px] font-semibold text-ink-500 uppercase tracking-wider',
                    i >= 4 ? 'text-right' : 'text-left',
                  )}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {MOCK_REPORTS.map((r) => (
                <tr key={r.id} className="border-t border-ink-100 hover:bg-brand-25 transition-colors">
                  <td className="px-5 py-3 font-semibold text-ink-800">{r.childName}</td>
                  <td className="px-5 py-3 text-ink-500">세션 #{r.sessionId}</td>
                  <td className="px-5 py-3 font-mono-num text-ink-500">{r.date}</td>
                  <td className="px-5 py-3">
                    <span className={cn(
                      'inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold',
                      r.status === 'PUBLISHED' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700',
                    )}>
                      {r.status === 'PUBLISHED' ? '발행됨' : '초안'}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right font-mono-num font-semibold text-ink-800">
                    {r.mlu != null ? r.mlu.toFixed(2) : '—'}
                  </td>
                  <td className="px-5 py-3 text-right">
                    <button
                      onClick={() => navigate(`/sessions/${r.sessionId}`)}
                      className="inline-flex items-center gap-1 text-[12px] text-brand-600 font-semibold hover:text-brand-800"
                    >
                      보기 <Icon name="chevronRight" size={12} strokeWidth={2.2} />
                    </button>
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
