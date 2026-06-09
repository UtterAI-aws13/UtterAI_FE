import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { templatesApi, type Template } from '@/api/templates'
import { Icon } from '@/components/common/Icon'
import { useToast } from '@/hooks/useToast'
import { cn } from '@/lib/utils'

const CATEGORIES = ['세션', '평가', '리포트']

const schema = z.object({
  name:     z.string().min(1, '템플릿 이름을 입력해주세요.'),
  category: z.string().min(1, '카테고리를 선택해주세요.'),
  content:  z.string().optional(),
})
type FormValues = z.infer<typeof schema>

interface Props {
  template?: Template
  onClose:   () => void
  onSaved:   (template: Template) => void
}

export function TemplateFormModal({ template, onClose, onSaved }: Props) {
  const { showToast } = useToast()
  const isEdit = !!template

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver:      zodResolver(schema),
    defaultValues: {
      name:     template?.name ?? '',
      category: template?.category ?? '세션',
      content:  template?.content ?? '',
    },
  })

  const onSubmit = async (values: FormValues) => {
    try {
      const { data } = isEdit
        ? await templatesApi.update(template.id, values)
        : await templatesApi.create({ name: values.name, category: values.category, content: values.content ?? '' })

      showToast({
        title: isEdit ? '템플릿이 수정되었습니다' : '템플릿이 생성되었습니다',
        kind:  'success',
      })
      onSaved(data)
      onClose()
    } catch {
      showToast({ title: isEdit ? '템플릿 수정에 실패했습니다' : '템플릿 생성에 실패했습니다', kind: 'error' })
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
        className="bg-white rounded-2xl shadow-xl w-full max-w-[480px] mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-ink-100">
          <h2 className="text-[16px] font-bold text-ink-800">
            {isEdit ? '템플릿 편집' : '새 템플릿'}
          </h2>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-ink-400 hover:bg-ink-100 transition-colors"
          >
            <Icon name="x" size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="px-6 py-5 flex flex-col gap-4">
          <div>
            <label className="block text-[12px] font-medium text-ink-800 mb-1.5">
              템플릿 이름 <span className="text-red-500">*</span>
            </label>
            <input {...register('name')} placeholder="템플릿 이름을 입력하세요" className={inputCls(!!errors.name)} />
            {errors.name && <p className="mt-1 text-[11px] text-red-700">{errors.name.message}</p>}
          </div>

          <div>
            <label className="block text-[12px] font-medium text-ink-800 mb-2">
              카테고리 <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-3">
              {CATEGORIES.map((c) => (
                <label key={c} className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" {...register('category')} value={c} className="accent-brand-700" />
                  <span className="text-[13px] text-ink-800">{c}</span>
                </label>
              ))}
            </div>
            {errors.category && <p className="mt-1 text-[11px] text-red-700">{errors.category.message}</p>}
          </div>

          <div>
            <label className="block text-[12px] font-medium text-ink-800 mb-1.5">내용 (선택)</label>
            <textarea
              {...register('content')}
              rows={5}
              placeholder="템플릿 내용을 입력하세요"
              className={cn(inputCls(), 'h-auto py-2 resize-none')}
            />
          </div>

          <div className="pt-1 flex justify-end gap-2">
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
              {isSubmitting ? (isEdit ? '저장 중…' : '생성 중…') : (isEdit ? '저장' : '생성')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
