import { cn } from '@/lib/utils'
import type { SessionStatus } from '@/api/sessions'

const STATUS_MAP: Record<SessionStatus, { label: string; className: string }> = {
  CREATED:              { label: '생성됨',     className: 'bg-ink-100 text-ink-600' },
  AUDIO_UPLOADED:       { label: '음성 업로드', className: 'bg-blue-100 text-blue-700' },
  ANALYSIS_PROCESSING:  { label: '분석 중',    className: 'bg-amber-100 text-amber-700' },
  ANALYSIS_COMPLETED:   { label: '분석 완료',  className: 'bg-brand-100 text-brand-700' },
  REPORT_READY:         { label: '리포트 완료', className: 'bg-green-100 text-green-700' },
  FAILED:               { label: '실패',       className: 'bg-red-100 text-red-700' },
}

interface StatusBadgeProps {
  status: SessionStatus
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const { label, className: colorClass } = STATUS_MAP[status] ?? STATUS_MAP.CREATED
  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold',
        colorClass,
        className,
      )}
    >
      {label}
    </span>
  )
}
