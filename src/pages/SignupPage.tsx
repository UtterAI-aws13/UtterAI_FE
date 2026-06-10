import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useSignup } from '@/hooks/useAuth'
import { Icon } from '@/components/common/Icon'
import { cn } from '@/lib/utils'

const schema = z.object({
  name:     z.string().min(1, '이름을 입력해주세요.'),
  email:    z.string().email('올바른 이메일 형식을 입력해주세요.'),
  password: z.string().min(8, '비밀번호는 8자 이상이어야 합니다.'),
  confirm:  z.string().min(1, '비밀번호를 한 번 더 입력해주세요.'),
  role:     z.enum(['SLP', 'ADMIN']),
}).refine((d) => d.password === d.confirm, {
  message: '비밀번호가 일치하지 않습니다.',
  path: ['confirm'],
})
type FormValues = z.infer<typeof schema>

const ROLES = [
  { value: 'SLP' as const, name: '치료사 (SLP)',  desc: '세션 녹음·분석·리포트 작성', icon: 'user'   as const },
  { value: 'ADMIN'     as const, name: '관리자',  desc: '기관·사용자 관리',           icon: 'shield' as const },
]

function pwStrength(pw: string) {
  if (!pw) return 0
  let s = 0
  if (pw.length >= 8) s++
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) s++
  if (/\d/.test(pw) && /[^A-Za-z0-9]/.test(pw)) s++
  return s
}

export default function SignupPage() {
  const [showPw, setShowPw] = useState(false)
  const signup = useSignup()

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { role: 'SLP' },
  })

  const password = watch('password') ?? ''
  const role     = watch('role')
  const strength = pwStrength(password)
  const strengthLabel = ['', '약함', '보통', '강함'][strength]
  const strengthColor = ['#E2E6E4', '#EF4444', '#F59E0B', '#15803D'][strength]

  const onSubmit = ({ confirm: _c, ...rest }: FormValues) =>
    signup.mutate(rest)

  const fieldClass = (hasErr?: boolean) => cn(
    'w-full h-[46px] pl-10 pr-4 rounded-[10px] text-[13.5px] outline-none transition-all bg-brand-25 border font-sans',
    hasErr
      ? 'border-red-400 focus:ring-2 focus:ring-red-200'
      : 'border-ink-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/16',
  )

  return (
    <div className="flex min-h-screen bg-brand-25 font-sans">
      {/* Left */}
      <div className="hidden md:flex flex-[0_0_60%] relative flex-col justify-between p-12 overflow-hidden"
        style={{ background: 'linear-gradient(135deg,#0F2A24 0%,#1A3C34 45%,#245249 100%)' }}>
        <div className="relative z-10 flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center">
            <svg width="14" height="14" viewBox="0 0 64 64" fill="none">
              <rect x="6" y="26" width="6" height="12" rx="3" fill="#B7DEC8"/>
              <rect x="16" y="18" width="6" height="28" rx="3" fill="#B7DEC8"/>
              <rect x="26" y="10" width="6" height="44" rx="3" fill="#fff"/>
              <rect x="36" y="16" width="6" height="32" rx="3" fill="#B7DEC8"/>
              <rect x="46" y="24" width="6" height="16" rx="3" fill="#B7DEC8"/>
            </svg>
          </div>
          <span className="text-sm font-bold text-white tracking-tight">UtterAI</span>
        </div>
        <div className="relative z-10 max-w-[460px]">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-200/12 border border-brand-200/20 text-brand-200 text-[11px] font-semibold mb-4">
            <span className="w-1 h-1 rounded-full bg-brand-200" />지금 합류하세요
          </div>
          <h2 className="text-4xl font-bold text-white tracking-tight leading-tight">
            치료 기록을 위한<br /><span className="text-brand-200">가장 따뜻한 도구.</span>
          </h2>
          <p className="mt-4 text-sm text-brand-100/80 leading-relaxed">
            전국 200여 개 발달센터의 언어치료사가 UtterAI로 세션을 기록하고<br />
            보호자에게 더 명확한 리포트를 전달하고 있어요.
          </p>
          <div className="mt-7 flex flex-col gap-3">
            {[
              { t: '14일 무료 체험',  d: '카드 등록 없이 모든 기능 사용' },
              { t: '의료급여법 준수', d: '국내 서버 · 암호화 보관' },
              { t: '언제든 해지 가능', d: '데이터는 30일간 보관 후 자동 삭제' },
            ].map((f) => (
              <div key={f.t} className="flex gap-3 items-start">
                <div className="w-5 h-5 rounded-full bg-brand-200/16 flex items-center justify-center text-brand-200 flex-shrink-0 mt-0.5">
                  <Icon name="check" size={11} strokeWidth={3} />
                </div>
                <div>
                  <p className="text-[13px] font-semibold text-white">{f.t}</p>
                  <p className="text-[11px] text-brand-100/65 mt-0.5">{f.d}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <p className="relative z-10 text-[11px] text-brand-200/55">© 2026 UtterAI · All rights reserved</p>
      </div>

      {/* Right */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-[440px] bg-white rounded-2xl shadow-xl px-9 py-9 overflow-y-auto max-h-[calc(100vh-64px)]">
          <p className="text-[11px] font-bold tracking-[0.18em] text-brand-500 uppercase text-center mb-5">UTTER AI</p>
          <h1 className="text-2xl font-bold text-brand-900 tracking-tight text-center">계정을 만들어보세요</h1>
          <p className="text-[12.5px] text-ink-500 text-center mt-2.5 leading-relaxed">
            UtterAI와 함께 더 체계적인<br />언어 치료를 시작하세요.
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-6 flex flex-col gap-2.5">
            {/* Name */}
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400 pointer-events-none">
                <Icon name="user" size={16} strokeWidth={1.8} />
              </span>
              <input {...register('name')} placeholder="홍길동" autoComplete="name" className={fieldClass(!!errors.name)} />
              {errors.name && <p className="mt-1 pl-1 text-[11px] text-red-700">{errors.name.message}</p>}
            </div>

            {/* Email */}
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400 pointer-events-none">
                <Icon name="mail" size={16} strokeWidth={1.8} />
              </span>
              <input {...register('email')} type="email" placeholder="example@email.com" autoComplete="email" className={fieldClass(!!errors.email)} />
              {errors.email && <p className="mt-1 pl-1 text-[11px] text-red-700">{errors.email.message}</p>}
            </div>

            {/* Password */}
            <div>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400 pointer-events-none">
                  <Icon name="lock" size={16} strokeWidth={1.8} />
                </span>
                <input
                  {...register('password')}
                  type={showPw ? 'text' : 'password'}
                  placeholder="비밀번호 (8자 이상)"
                  autoComplete="new-password"
                  className={cn(fieldClass(!!errors.password), 'pr-10')}
                />
                <button type="button" onClick={() => setShowPw((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400">
                  <Icon name={showPw ? 'eyeOff' : 'eye'} size={16} strokeWidth={1.8} />
                </button>
              </div>
              {password && !errors.password && (
                <div className="mt-1.5 pl-1">
                  <div className="flex gap-1">
                    {[0,1,2].map((i) => (
                      <div key={i} className="flex-1 h-[3px] rounded-full transition-colors"
                        style={{ background: i < strength ? strengthColor : '#E2E6E4' }} />
                    ))}
                  </div>
                  <p className="text-[10.5px] mt-1 font-semibold" style={{ color: strengthColor }}>
                    비밀번호 강도: {strengthLabel}
                  </p>
                </div>
              )}
              {errors.password && <p className="mt-1 pl-1 text-[11px] text-red-700">{errors.password.message}</p>}
            </div>

            {/* Confirm */}
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400 pointer-events-none">
                <Icon name="lock" size={16} strokeWidth={1.8} />
              </span>
              <input {...register('confirm')} type="password" placeholder="비밀번호 확인" autoComplete="new-password" className={fieldClass(!!errors.confirm)} />
              {errors.confirm && <p className="mt-1 pl-1 text-[11px] text-red-700">{errors.confirm.message}</p>}
            </div>

            {/* Role */}
            <div className="mt-1">
              <label className="block text-[11.5px] font-semibold text-ink-600 mb-2 pl-1">역할 선택</label>
              <div className="flex gap-2">
                {ROLES.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setValue('role', opt.value)}
                    className={cn(
                      'flex-1 flex items-center gap-2.5 p-3 rounded-[10px] border transition-all text-left',
                      role === opt.value
                        ? 'border-brand-700 bg-brand-50 shadow-[0_0_0_3px_rgba(45,106,79,0.14)]'
                        : 'border-ink-200 bg-brand-25',
                    )}
                  >
                    <div className={cn(
                      'w-7.5 h-7.5 rounded-lg flex items-center justify-center flex-shrink-0 border',
                      role === opt.value ? 'bg-brand-700 border-transparent text-brand-200' : 'bg-white border-ink-200 text-ink-500',
                    )}>
                      <Icon name={opt.icon} size={14} strokeWidth={2} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={cn('text-[13px]', role === opt.value ? 'font-semibold text-brand-700' : 'font-medium text-ink-800')}>{opt.name}</p>
                      <p className={cn('text-[10.5px]', role === opt.value ? 'text-brand-600' : 'text-ink-500')}>{opt.desc}</p>
                    </div>
                    <span className={cn(
                      'w-3.5 h-3.5 rounded-full flex-shrink-0 border bg-white transition-all',
                      role === opt.value ? 'border-[4px] border-brand-700' : 'border-ink-300',
                    )} />
                  </button>
                ))}
              </div>
              <p className="mt-2 pl-1 text-[10.5px] text-ink-400 flex items-center gap-1">
                <Icon name="info" size={11} strokeWidth={2} />역할은 가입 후 변경할 수 없습니다.
              </p>
            </div>

            <button
              type="submit"
              disabled={signup.isPending}
              className={cn(
                'mt-4 w-full h-12 rounded-full text-white text-[14px] font-semibold flex items-center justify-center gap-2 transition-colors shadow-[0_8px_16px_-4px_rgba(26,60,52,0.25)]',
                signup.isPending ? 'bg-brand-600 cursor-wait' : 'bg-brand-700 hover:bg-brand-900',
              )}
            >
              {signup.isPending ? '가입 중…' : <>회원가입 <Icon name="chevronRight" size={15} strokeWidth={2.4} /></>}
            </button>
          </form>

          <p className="mt-5 text-center text-[12px] text-ink-500">
            이미 계정이 있으신가요?{' '}
            <Link to="/login" className="text-brand-700 font-semibold hover:text-brand-900">로그인</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
