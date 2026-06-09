import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { reportsApi, type Report } from '@/api/reports'
import { Icon } from '@/components/common/Icon'
import { ReportEditModal } from '@/components/common/ReportEditModal'
import { cn, formatDate } from '@/lib/utils'
import { useToast } from '@/hooks/useToast'

export default function ReportsPage() {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const [editingReport, setEditingReport] = useState<Report | null>(null)

  useEffect(() => {
    reportsApi.list()
      .then(({ data }) => setReports(data))
      .catch(() => showToast({ title: '리포트 목록을 불러오지 못했습니다', kind: 'error' }))
      .finally(() => setLoading(false))
  }, [])

  const handleDownload = async (report: Report) => {
    try {
      const { data } = await reportsApi.download(report.id)
      const url = URL.createObjectURL(new Blob([data]))
      const a = document.createElement('a')
      a.href = url
      a.download = `${report.title}.txt`
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      showToast({ title: '다운로드에 실패했습니다', kind: 'error' })
    }
  }

  return (
    <div>
      <div className="px-8 pt-7 pb-5">
        <h1 className="text-2xl font-bold text-ink-800 tracking-tight">리포트</h1>
        <p className="text-[13px] text-ink-500 mt-1">총 {reports.length}개 리포트</p>
      </div>

      <div className="px-8 pb-8">
        {loading ? (
          <div className="text-center py-12 text-[13px] text-ink-400">불러오는 중…</div>
        ) : reports.length === 0 ? (
          <div className="bg-white rounded-xl border border-ink-200 shadow-sm py-16 text-center">
            <p className="text-[15px] font-semibold text-ink-800">리포트가 없습니다</p>
            <p className="text-[12px] text-ink-500 mt-1.5">세션 분석을 완료하면 리포트가 생성됩니다.</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-ink-200 shadow-sm overflow-hidden">
            <table className="w-full text-[13px] border-collapse">
              <thead>
                <tr className="bg-ink-50 border-b border-ink-100">
                  {['제목', '세션', '상태', '생성일', ''].map((h, i) => (
                    <th key={i} className={cn(
                      'py-2.5 px-5 text-[11px] font-semibold text-ink-500 uppercase tracking-wider',
                      i >= 4 ? 'text-right' : 'text-left',
                    )}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {reports.map((r) => (
                  <tr key={r.id} className="border-t border-ink-100 hover:bg-brand-25 transition-colors">
                    <td className="px-5 py-3 font-semibold text-ink-800">{r.title}</td>
                    <td className="px-5 py-3 text-ink-500 font-mono-num text-[12px]">
                      {r.session_id.slice(-8)}
                    </td>
                    <td className="px-5 py-3">
                      <span className={cn(
                        'inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold',
                        r.status === 'PUBLISHED' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700',
                      )}>
                        {r.status === 'PUBLISHED' ? '발행됨' : '초안'}
                      </span>
                    </td>
                    <td className="px-5 py-3 font-mono-num text-ink-500">{formatDate(r.created_at)}</td>
                    <td className="px-5 py-3 text-right">
                      <div className="inline-flex gap-2 items-center">
                        <button
                          onClick={() => navigate(`/sessions/${r.session_id}`)}
                          className="inline-flex items-center gap-1 text-[12px] text-brand-600 font-semibold hover:text-brand-800"
                        >
                          보기 <Icon name="chevronRight" size={12} strokeWidth={2.2} />
                        </button>
                        {r.status !== 'PUBLISHED' && (
                          <button
                            onClick={() => setEditingReport(r)}
                            className="w-6 h-6 flex items-center justify-center rounded-md text-ink-400 hover:bg-ink-100 hover:text-ink-700 transition-colors"
                            title="편집"
                          >
                            <Icon name="edit" size={13} />
                          </button>
                        )}
                        <button
                          onClick={() => handleDownload(r)}
                          className="w-6 h-6 flex items-center justify-center rounded-md text-ink-400 hover:bg-ink-100 hover:text-ink-700 transition-colors"
                          title="다운로드"
                        >
                          <Icon name="download" size={13} strokeWidth={2.2} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {editingReport && (
        <ReportEditModal
          report={editingReport}
          onClose={() => setEditingReport(null)}
          onSaved={(updated) => setReports((rs) => rs.map((r) => r.id === updated.id ? updated : r))}
        />
      )}
    </div>
  )
}
