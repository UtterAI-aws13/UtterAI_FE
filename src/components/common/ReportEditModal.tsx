import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { reportsApi, type Report } from '@/api/reports'
import { Icon } from '@/components/common/Icon'
import { useToast } from '@/hooks/useToast'
import { cn } from '@/lib/utils'

const schema = z.object({
  title:   z.string().min(1, '제목을 입력해주세요.'),
  content: z.string().optional(),
  memo:    z.string().optional(),
})
type FormValues = z.infer<typeof schema>

interface Props {
  report:  Report
  onClose: () => void
  onSaved: (report: Report) => void
}

export function ReportEditModal({ report, onClose, onSaved }: Props) {
  const { showToast } = useToast()

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver:      zodResolver(schema),
    defaultValues: {
      title:   report.title,
      content: report.content,
      memo:    report.memo ?? '',
    },
  })

  const onSubmit = async (values: FormValues) => {
    try {
      const { data } = await reportsApi.update(report.id, {
        title:   values.title,
        content: values.content || undefined,
        memo:    values.memo    || undefined,
      })
      showToast({ title: '리포트가 저장되었습니다', kind: 'success' })
      onSaved(data)
      onClose()
    } catch {
      showToast({ title: '저장에 실패했습니다', kind: 'error' })
    }
  }

  const inputCls = (err?: boolean) => cn(
    'w-full h-10 px-3 rounded-lg text-[13px] outline-none transition-all border font-sans',
    err
      ? 'border-red-400 bg-white'
      : 'border-ink-300 bg-white focus:border-brand-500 focus:ring-2 focus:ring-brand-500/16',
  )

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-[600px] mx-4 max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-ink-100 flex-shrink-0">
          <h2 className="text-[16px] font-bold text-ink-800">리포트 편집</h2>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-ink-400 hover:bg-ink-100 transition-colors"
          >
            <Icon name="x" size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="px-6 py-5 flex flex-col gap-4 overflow-y-auto">
          <div>
            <label className="block text-[12px] font-medium text-ink-800 mb-1.5">
              제목 <span className="text-red-500">*</span>
            </label>
            <input {...register('title')} className={inputCls(!!errors.title)} />
            {errors.title && <p className="mt-1 text-[11px] text-red-700">{errors.title.message}</p>}
          </div>

          <div>
            <label className="block text-[12px] font-medium text-ink-800 mb-1.5">내용</label>
            <textarea
              {...register('content')}
              rows={12}
              className={cn(inputCls(), 'h-auto py-2 resize-none leading-relaxed')}
            />
          </div>

          <div>
            <label className="block text-[12px] font-medium text-ink-800 mb-1.5">메모 (선택)</label>
            <textarea
              {...register('memo')}
              rows={3}
              placeholder="내부 메모를 입력하세요"
              className={cn(inputCls(), 'h-auto py-2 resize-none')}
            />
          </div>

          <div className="pt-1 flex justify-end gap-2 flex-shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-ink-200 text-ink-600 rounded-full text-[13px] font-semibold hover:bg-ink-50 transition-colors"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-brand-700 text-white rounded-full text-[13px] font-semibold hover:bg-brand-900 transition-colors disabled:opacity-60"
            >
              {isSubmitting ? '저장 중…' : '저장'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
