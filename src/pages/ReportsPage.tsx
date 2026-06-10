import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { reportsApi, type Report, type ReportStatus } from '@/api/reports'
import { Icon } from '@/components/common/Icon'
import { cn, formatDate } from '@/lib/utils'
import { useToast } from '@/hooks/useToast'

const STATUS_LABEL: Record<ReportStatus, { label: string; cls: string }> = {
  DRAFT:     { label: '초안',    cls: 'bg-amber-100 text-amber-700' },
  REVIEWING: { label: '검토 중', cls: 'bg-blue-100 text-blue-700' },
  APPROVED:  { label: '승인됨',  cls: 'bg-green-100 text-green-700' },
  FINALIZED: { label: '확정됨',  cls: 'bg-brand-100 text-brand-700' },
  DELETED:   { label: '삭제됨',  cls: 'bg-ink-100 text-ink-500' },
}

export default function ReportsPage() {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let ignore = false
    reportsApi.list()
      .then(({ data }) => { if (!ignore) setReports(data) })
      .catch(() => { if (!ignore) showToast({ title: '리포트 목록을 불러오지 못했습니다', kind: 'error' }) })
      .finally(() => { if (!ignore) setLoading(false) })
    return () => { ignore = true }
  }, [])

  const handleDownload = async (report: Report) => {
    try {
      const { data } = await reportsApi.download(report.id)
      const url = URL.createObjectURL(new Blob([data]))
      const a = document.createElement('a')
      a.href = url
      a.download = `report-${report.id.slice(-8)}.txt`
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
                  {['세션', '모델', '상태', '생성일', ''].map((h, i) => (
                    <th key={i} className={cn(
                      'py-2.5 px-5 text-[11px] font-semibold text-ink-500 uppercase tracking-wider',
                      i >= 4 ? 'text-right' : 'text-left',
                    )}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {reports.map((r) => {
                  const statusInfo = STATUS_LABEL[r.status] ?? STATUS_LABEL.DRAFT
                  return (
                    <tr key={r.id} className="border-t border-ink-100 hover:bg-brand-25 transition-colors">
                      <td className="px-5 py-3 font-mono-num text-ink-500 text-[12px]">
                        {r.session_id.slice(-8)}
                      </td>
                      <td className="px-5 py-3 text-ink-500 text-[12px]">
                        {r.model_used ?? '—'}
                      </td>
                      <td className="px-5 py-3">
                        <span className={cn('inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold', statusInfo.cls)}>
                          {statusInfo.label}
                        </span>
                      </td>
                      <td className="px-5 py-3 font-mono-num text-ink-500">
                        {formatDate(r.generated_at ?? r.updated_at)}
                      </td>
                      <td className="px-5 py-3 text-right">
                        <div className="inline-flex gap-2 items-center">
                          <button
                            onClick={() => navigate(`/sessions/${r.session_id}`)}
                            className="inline-flex items-center gap-1 text-[12px] text-brand-600 font-semibold hover:text-brand-800"
                          >
                            보기 <Icon name="chevronRight" size={12} strokeWidth={2.2} />
                          </button>
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
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
