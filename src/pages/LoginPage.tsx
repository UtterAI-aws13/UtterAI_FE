import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useLogin } from '@/hooks/useAuth'
import { Icon } from '@/components/common/Icon'
import { cn } from '@/lib/utils'

const schema = z.object({
  email:    z.string().email('올바른 이메일 형식이 아닙니다.'),
  password: z.string().min(1, '비밀번호를 입력해주세요.'),
})
type FormValues = z.infer<typeof schema>

const FEATURES = [
  { t: '실시간 화자 분리',    d: '아동 · 치료사 · 미상 자동 식별' },
  { t: '언어 지표 자동 산출', d: 'MLU · TTR · 어휘 다양도' },
  { t: 'SOAP Note 초안 생성', d: '치료사 톤으로 맞춤 작성' },
]

function OrganicBackdrop() {
  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none"
      viewBox="0 0 800 900"
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <radialGradient id="blob-a" cx="35%" cy="30%" r="60%">
          <stop offset="0%" stopColor="#4D8A6F" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#1A3C34" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="blob-b" cx="75%" cy="75%" r="50%">
          <stop offset="0%" stopColor="#7FB196" stopOpacity="0.42" />
          <stop offset="100%" stopColor="#1A3C34" stopOpacity="0" />
        </radialGradient>
      </defs>
      <ellipse cx="180" cy="280" rx="380" ry="260" fill="url(#blob-a)" />
      <ellipse cx="640" cy="700" rx="320" ry="240" fill="url(#blob-b)" />
      <path d="M -20 540 Q 200 480 400 540 T 820 540" stroke="rgba(183,222,200,0.22)" strokeWidth="1.4" fill="none" />
      <path d="M -20 580 Q 200 530 400 580 T 820 580" stroke="rgba(183,222,200,0.14)" strokeWidth="1.2" fill="none" />
      <g transform="translate(220, 380)" opacity="0.6">
        {[12,22,38,52,70,86,70,52,38,22,12].map((h, i) => (
          <rect key={i} x={i*18} y={50-h/2} width="6" height={h} rx="3" fill="#B7DEC8" opacity={0.35+(i%5)*0.08} />
        ))}
      </g>
    </svg>
  )
}

export default function LoginPage() {
  const [showPw, setShowPw] = useState(false)
  const login = useLogin()

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  })

  const onSubmit = (values: FormValues) => login.mutate(values)

  return (
    <div className="flex min-h-screen bg-brand-25 font-sans">
      {/* Left panel */}
      <div className="hidden md:flex flex-[0_0_60%] relative flex-col justify-between p-12 overflow-hidden"
        style={{ background: 'linear-gradient(135deg,#0F2A24 0%,#1A3C34 45%,#245249 100%)' }}>
        <OrganicBackdrop />

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
            <span className="w-1 h-1 rounded-full bg-brand-200" />
            아동 언어치료 AI 분석 플랫폼
          </div>
          <h2 className="text-4xl font-bold text-white tracking-tight leading-tight">
            매 세션의 작은 발화까지<br />
            <span className="text-brand-200">꼼꼼히 듣고 기록합니다.</span>
          </h2>
          <p className="mt-4 text-sm text-brand-100/80 leading-relaxed">
            UtterAI는 치료사가 더 깊이 듣고, 보호자가 더 잘 이해할 수 있도록<br />
            음성 분석 · 전사 · 언어 지표 · 리포트를 자동으로 정리해드립니다.
          </p>
          <div className="mt-7 flex flex-col gap-3">
            {FEATURES.map((f) => (
              <div key={f.t} className="flex gap-3 items-start">
                <div className="w-5.5 h-5.5 rounded-full bg-brand-200/16 flex items-center justify-center text-brand-200 flex-shrink-0 mt-0.5">
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

        <div className="relative z-10 flex items-center justify-between text-[11px] text-brand-200/55">
          <span>© 2026 UtterAI · All rights reserved</span>
          <div className="flex gap-4">
            <button className="hover:text-brand-200 transition-colors">이용약관</button>
            <button className="hover:text-brand-200 transition-colors">개인정보처리방침</button>
          </div>
        </div>
      </div>

      {/* Right panel — auth card */}
      <div className="flex-1 flex items-center justify-center p-8 bg-brand-25">
        <div className="w-full max-w-[420px] bg-white rounded-2xl shadow-xl p-10 flex flex-col">
          {/* Logo */}
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3"
            style={{ background: 'linear-gradient(135deg,#1A3C34 0%,#2D6A4F 60%,#4D8A6F 100%)' }}
          >
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <path d="M6 9 a4 4 0 0 1 4-4 h12 a4 4 0 0 1 4 4 v8 a4 4 0 0 1 -4 4 h-8 l-5 4 v-4 h-3 a-2 -2 0 0 1 -2 -2 z"
                stroke="#B7DEC8" strokeWidth="1.8" strokeLinejoin="round" fill="none" />
              <rect x="11" y="11" width="2" height="4"  rx="1" fill="#B7DEC8"/>
              <rect x="14" y="9"  width="2" height="8"  rx="1" fill="#D8ECDF"/>
              <rect x="17" y="7"  width="2" height="12" rx="1" fill="#fff"/>
              <rect x="20" y="10" width="2" height="6"  rx="1" fill="#D8ECDF"/>
            </svg>
          </div>
          <p className="text-[11px] font-bold tracking-[0.18em] text-brand-500 uppercase text-center mb-5">UTTER AI</p>

          <h1 className="text-2xl font-bold text-brand-900 tracking-tight leading-snug text-center">
            당신의 언어 성장을<br />더 따뜻하게 기록하다
          </h1>
          <p className="text-[12.5px] text-ink-500 text-center mt-2.5 leading-relaxed">
            치료 기록, 음성 분석, 발화 데이터를<br />한 곳에서 안전하게 관리하세요.
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-7 flex flex-col gap-2.5">
            {/* Email */}
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400 pointer-events-none">
                <Icon name="mail" size={16} strokeWidth={1.8} />
              </span>
              <input
                {...register('email')}
                type="email"
                autoComplete="email"
                placeholder="이메일 주소"
                className={cn(
                  'w-full h-[46px] pl-10 pr-4 rounded-[10px] text-[13.5px] outline-none transition-all',
                  'bg-brand-25 border font-sans',
                  errors.email
                    ? 'border-red-400 focus:ring-2 focus:ring-red-200'
                    : 'border-ink-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/16',
                )}
              />
              {errors.email && (
                <p className="mt-1.5 pl-1 text-[11.5px] text-red-700 font-medium flex items-center gap-1">
                  <Icon name="alert" size={11} strokeWidth={2.5} />{errors.email.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div className="relative">
              <span className="absolute left-3.5 top-[23px] -translate-y-1/2 text-ink-400 pointer-events-none">
                <Icon name="lock" size={16} strokeWidth={1.8} />
              </span>
              <input
                {...register('password')}
                type={showPw ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="비밀번호"
                className={cn(
                  'w-full h-[46px] pl-10 pr-10 rounded-[10px] text-[13.5px] outline-none transition-all',
                  'bg-brand-25 border font-sans',
                  errors.password
                    ? 'border-red-400 focus:ring-2 focus:ring-red-200'
                    : 'border-ink-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/16',
                )}
              />
              <button
                type="button"
                onClick={() => setShowPw((s) => !s)}
                className="absolute right-3 top-[23px] -translate-y-1/2 text-ink-400 hover:text-ink-600 p-1"
              >
                <Icon name={showPw ? 'eyeOff' : 'eye'} size={16} strokeWidth={1.8} />
              </button>
              {errors.password && (
                <p className="mt-1.5 pl-1 text-[11.5px] text-red-700 font-medium flex items-center gap-1">
                  <Icon name="alert" size={11} strokeWidth={2.5} />{errors.password.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={login.isPending}
              className={cn(
                'mt-4 w-full h-12 rounded-full text-white text-[14px] font-semibold',
                'flex items-center justify-center gap-2 transition-colors',
                'shadow-[0_8px_16px_-4px_rgba(26,60,52,0.25)]',
                login.isPending
                  ? 'bg-brand-600 cursor-wait'
                  : 'bg-brand-700 hover:bg-brand-900',
              )}
            >
              {login.isPending ? (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.4"
                    style={{ animation: 'spin 0.8s linear infinite' }}>
                    <circle cx="12" cy="12" r="9" strokeOpacity="0.25"/>
                    <path d="M21 12 a9 9 0 0 0 -9 -9" strokeLinecap="round" />
                  </svg>
                  로그인 중…
                </>
              ) : (
                <>안전하게 로그인 <Icon name="chevronRight" size={15} strokeWidth={2.4} /></>
              )}
            </button>
          </form>

          <div className="mt-5 flex items-center justify-between text-[12px] flex-wrap gap-2">
            <button className="text-ink-500 hover:text-brand-700 font-medium transition-colors">
              비밀번호를 잊으셨나요?
            </button>
            <span className="text-ink-500 whitespace-nowrap">
              처음 방문하셨나요?{' '}
              <Link to="/signup" className="text-brand-700 font-semibold hover:text-brand-900">
                회원 가입
              </Link>
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
