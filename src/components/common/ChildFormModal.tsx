import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { childrenApi, type Child } from '@/api/children'
import { Icon } from '@/components/common/Icon'
import { useToast } from '@/hooks/useToast'
import { cn } from '@/lib/utils'

const schema = z.object({
  name:       z.string().min(1, '이름을 입력해주세요.'),
  birth_date: z.string().optional(),
  gender:     z.enum(['M', 'F', 'U']).optional(),
  memo:       z.string().optional(),
})
type FormValues = z.infer<typeof schema>

interface Props {
  child?:  Child
  onClose: () => void
  onDone:  (child: Child) => void
}

export function ChildFormModal({ child, onClose, onDone }: Props) {
  const isEdit = !!child
  const { showToast } = useToast()

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver:      zodResolver(schema),
    defaultValues: {
      name:       child?.name       ?? '',
      birth_date: child?.birth_date ?? '',
      gender:     (child?.gender as 'M' | 'F' | 'U') ?? 'U',
      memo:       child?.memo       ?? '',
    },
  })

  const onSubmit = async (values: FormValues) => {
    try {
      const payload = {
        name:       values.name,
        birth_date: values.birth_date || undefined,
        gender:     values.gender !== 'U' ? values.gender : undefined,
        memo:       values.memo || undefined,
      }
      const { data } = isEdit
        ? await childrenApi.update(child.id, payload)
        : await childrenApi.create(payload)

      showToast({
        title: isEdit ? '아동 정보가 수정되었습니다' : '아동이 등록되었습니다',
        body:  isEdit ? undefined : `${values.name} 아동이 추가되었어요.`,
        kind:  'success',
      })
      onDone(data)
      onClose()
    } catch {
      showToast({ title: isEdit ? '수정에 실패했습니다' : '아동 등록에 실패했습니다', kind: 'error' })
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
        className="bg-white rounded-2xl shadow-xl w-full max-w-[440px] mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-ink-100">
          <h2 className="text-[16px] font-bold text-ink-800">{isEdit ? '아동 정보 수정' : '아동 등록'}</h2>
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
              이름 <span className="text-red-500">*</span>
            </label>
            <input {...register('name')} placeholder="아동 이름을 입력하세요" className={inputCls(!!errors.name)} />
            {errors.name && <p className="mt-1 text-[11px] text-red-700">{errors.name.message}</p>}
          </div>

          <div>
            <label className="block text-[12px] font-medium text-ink-800 mb-1.5">생년월일</label>
            <input type="date" {...register('birth_date')} className={inputCls()} />
          </div>

          <div>
            <label className="block text-[12px] font-medium text-ink-800 mb-2">성별</label>
            <div className="flex gap-5">
              {([['M', '남아'], ['F', '여아'], ['U', '미입력']] as const).map(([v, label]) => (
                <label key={v} className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" {...register('gender')} value={v} className="accent-brand-700" />
                  <span className="text-[13px] text-ink-800">{label}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-[12px] font-medium text-ink-800 mb-1.5">메모 (선택)</label>
            <textarea
              {...register('memo')}
              rows={3}
              placeholder="아동 관련 메모를 입력하세요"
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
              {isSubmitting ? (isEdit ? '저장 중…' : '등록 중…') : (isEdit ? '저장' : '등록')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
