import { reportsApi, type Report, type ReportSegment } from '@/api/reports'
import { Icon } from '@/components/common/Icon'
import { ReportChatPanel } from '@/components/common/ReportChatPanel'
import { useToast } from '@/hooks/useToast'
import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'

const EDITABLE_STATUSES = new Set(['DRAFT', 'REVIEWING', 'APPROVED'])

const SEGMENT_TYPE_LABELS: Record<string, string> = {
  SUBJECTIVE: 'Subjective — 주관적 정보',
  OBJECTIVE:  'Objective — 객관적 정보',
  ASSESSMENT: 'Assessment — 평가',
  PLAN:       'Plan — 계획',
  CUSTOM:     'Custom — 기타',
}

interface Props {
  report:  Report
  onClose: () => void
  onSaved: (report: Report) => void
}

export function ReportEditModal({ report, onClose, onSaved }: Props) {
  const { showToast } = useToast()
  const [segments, setSegments] = useState<ReportSegment[]>([])
  const [editValues, setEditValues] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)
  const [currentReport, setCurrentReport] = useState<Report>(report)

  const showChat = EDITABLE_STATUSES.has(report.status)

  const loadSegments = (reportId: string) => {
    reportsApi.listSegments(reportId)
      .then(({ data }) => {
        setSegments(data)
        const initial: Record<string, string> = {}
        data.forEach((s) => { initial[s.id] = s.content ?? s.ai_content ?? '' })
        setEditValues(initial)
      })
      .catch(() => showToast({ title: '세그먼트를 불러오지 못했습니다', kind: 'error' }))
  }

  useEffect(() => {
    loadSegments(report.id)
  }, [report.id])

  const handlePatchApplied = (newVersion: number, _updatedSections: string[]) => {
    setCurrentReport((prev) => ({ ...prev, version: newVersion }))
    loadSegments(report.id)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await Promise.all(
        segments.map((seg) =>
          reportsApi.updateSegment(report.id, seg.id, { content: editValues[seg.id] }),
        ),
      )
      showToast({ title: '리포트가 저장되었습니다', kind: 'success' })
      onSaved(report)
      onClose()
    } catch {
      showToast({ title: '저장에 실패했습니다', kind: 'error' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div
        className={cn(
          'bg-white rounded-2xl shadow-xl w-full mx-4 max-h-[90vh] flex flex-col',
          showChat ? 'max-w-[1080px]' : 'max-w-[640px]',
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-ink-100 flex-shrink-0">
          <div className="flex items-center gap-3">
            <h2 className="text-[16px] font-bold text-ink-800">리포트 편집</h2>
            {currentReport.version > 1 && (
              <span className="text-[11px] text-ink-400 bg-ink-50 px-2 py-0.5 rounded-full">
                v{currentReport.version}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-ink-400 hover:bg-ink-100 transition-colors"
          >
            <Icon name="x" size={16} />
          </button>
        </div>

        {/* body */}
        <div className={cn('flex min-h-0 flex-1 overflow-hidden', showChat && 'divide-x divide-ink-100')}>
          {/* 편집 영역 */}
          <div className={cn('flex flex-col', showChat ? 'w-[520px] flex-shrink-0' : 'flex-1')}>
            <div className="px-6 py-5 flex flex-col gap-4 overflow-y-auto flex-1">
              {segments.length === 0 ? (
                <p className="text-center text-[13px] text-ink-400 py-8">세그먼트를 불러오는 중…</p>
              ) : (
                segments.map((seg) => (
                  <div key={seg.id}>
                    <label className="block text-[12px] font-bold text-brand-700 uppercase tracking-wide mb-1.5">
                      {SEGMENT_TYPE_LABELS[seg.segment_type] ?? seg.segment_type}
                    </label>
                    <textarea
                      value={editValues[seg.id] ?? ''}
                      onChange={(e) => setEditValues((prev) => ({ ...prev, [seg.id]: e.target.value }))}
                      rows={5}
                      className={cn(
                        'w-full px-3 py-2 rounded-lg text-[13px] leading-relaxed border border-ink-300',
                        'bg-white outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/16 resize-none font-sans',
                      )}
                    />
                  </div>
                ))
              )}
            </div>

            <div className="px-6 pb-5 pt-2 flex justify-end gap-2 flex-shrink-0 border-t border-ink-100">
              <button
                onClick={onClose}
                className="px-4 py-2 border border-ink-200 text-ink-600 rounded-full text-[13px] font-semibold hover:bg-ink-50 transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleSave}
                disabled={saving || segments.length === 0}
                className="px-4 py-2 bg-brand-700 text-white rounded-full text-[13px] font-semibold hover:bg-brand-900 transition-colors disabled:opacity-60"
              >
                {saving ? '저장 중…' : '저장'}
              </button>
            </div>
          </div>

          {/* 챗 패널 — FINALIZED가 아닐 때만 렌더링 */}
          {showChat && (
            <div className="flex-1 min-w-0 flex flex-col overflow-hidden">
              <ReportChatPanel
                report={currentReport}
                onPatchApplied={handlePatchApplied}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
