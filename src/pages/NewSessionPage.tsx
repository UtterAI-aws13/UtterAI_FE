import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Icon } from '@/components/common/Icon'
import { useToast } from '@/hooks/useToast'
import { cn } from '@/lib/utils'

const MOCK_CHILDREN = [
  { id: 1, name: '박서윤', age: '6세 2개월' },
  { id: 2, name: '이하준', age: '5세 8개월' },
  { id: 3, name: '최예나', age: '4세 11개월' },
  { id: 4, name: '정도윤', age: '7세 1개월' },
]

const schema = z.object({
  childId: z.string().min(1, '아동을 선택해주세요.'),
  date:    z.string().min(1, '날짜를 입력해주세요.'),
  time:    z.string().min(1, '시간을 입력해주세요.'),
  kind:    z.enum(['개별', '그룹']),
})
type FormValues = z.infer<typeof schema>

export default function NewSessionPage() {
  const navigate = useNavigate()
  const { showToast } = useToast()

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { kind: '개별' },
  })

  const onSubmit = (_: FormValues) => {
    showToast({ title: '세션이 생성되었습니다', body: '이제 음성 파일을 업로드해주세요.', kind: 'success' })
    navigate('/sessions/24')
  }

  const inputClass = (hasErr?: boolean) => cn(
    'w-full h-10 px-3 rounded-lg text-[13px] outline-none transition-all border font-sans',
    hasErr
      ? 'border-red-400 bg-white'
      : 'border-ink-300 bg-white focus:border-brand-500 focus:ring-2 focus:ring-brand-500/16',
  )

  return (
    <div>
      <div className="px-8 pt-7 pb-5 flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-ink-500 hover:bg-ink-100 transition-colors"
        >
          <Icon name="arrowLeft" size={16} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-ink-800 tracking-tight">새 세션</h1>
          <p className="text-[13px] text-ink-500 mt-0.5">세션 기본 정보를 입력해주세요</p>
        </div>
      </div>

      <div className="px-8 pb-8 max-w-[520px]">
        <div className="bg-white rounded-xl border border-ink-200 shadow-sm p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
            {/* Child select */}
            <div>
              <label className="block text-[12px] font-medium text-ink-800 mb-1.5">아동 선택</label>
              <select {...register('childId')} className={cn(inputClass(!!errors.childId), 'cursor-pointer')}>
                <option value="">아동을 선택해주세요</option>
                {MOCK_CHILDREN.map((c) => (
                  <option key={c.id} value={c.id}>{c.name} ({c.age})</option>
                ))}
              </select>
              {errors.childId && <p className="mt-1 text-[11px] text-red-700">{errors.childId.message}</p>}
            </div>

            {/* Date + Time */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[12px] font-medium text-ink-800 mb-1.5">날짜</label>
                <input type="date" {...register('date')} className={inputClass(!!errors.date)} />
                {errors.date && <p className="mt-1 text-[11px] text-red-700">{errors.date.message}</p>}
              </div>
              <div>
                <label className="block text-[12px] font-medium text-ink-800 mb-1.5">시간</label>
                <input type="time" {...register('time')} className={inputClass(!!errors.time)} />
                {errors.time && <p className="mt-1 text-[11px] text-red-700">{errors.time.message}</p>}
              </div>
            </div>

            {/* Kind */}
            <div>
              <label className="block text-[12px] font-medium text-ink-800 mb-2">세션 유형</label>
              <div className="flex gap-3">
                {['개별', '그룹'].map((k) => (
                  <label key={k} className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" {...register('kind')} value={k} className="accent-brand-700" />
                    <span className="text-[13px] text-ink-800">{k}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="pt-2 flex gap-3">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="px-5 py-2 border border-ink-200 text-ink-600 rounded-full text-[13px] font-semibold hover:bg-ink-50 transition-colors"
              >
                취소
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-brand-700 text-white rounded-full text-[13px] font-semibold hover:bg-brand-900 transition-colors"
              >
                세션 생성
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
