import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation } from '@tanstack/react-query'
import { useAuthStore } from '@/store/authStore'
import { useLogout } from '@/hooks/useAuth'
import { useToast } from '@/hooks/useToast'
import { Icon } from '@/components/common/Icon'
import { cn } from '@/lib/utils'
import { authApi } from '@/api/auth'

type Tab = 'profile' | 'password'

const profileSchema = z.object({
  name:  z.string().min(1, '이름을 입력해주세요.'),
  email: z.string().email(),
  role:  z.string(),
})
type ProfileForm = z.infer<typeof profileSchema>

const pwSchema = z.object({
  current: z.string().min(8, '비밀번호는 8자 이상이어야 합니다.'),
  next:    z.string().min(8, '비밀번호는 8자 이상이어야 합니다.'),
  confirm: z.string().min(1, '비밀번호 확인을 입력해주세요.'),
}).refine((d) => d.next === d.confirm, {
  message: '비밀번호가 일치하지 않습니다.',
  path: ['confirm'],
})
type PwForm = z.infer<typeof pwSchema>

function InputField({
  label,
  error,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string; error?: string }) {
  const [focused, setFocused] = useState(false)
  return (
    <div>
      <label className="block text-[12px] font-medium text-ink-800 mb-1.5">{label}</label>
      <input
        {...props}
        onFocus={(e) => { setFocused(true); props.onFocus?.(e) }}
        onBlur={(e) => { setFocused(false); props.onBlur?.(e) }}
        className={cn(
          'w-full h-10 px-3 rounded-md text-[13px] outline-none transition-all border font-sans',
          props.disabled
            ? 'bg-ink-50 text-ink-400 border-ink-200 cursor-not-allowed'
            : error
            ? 'border-red-400 bg-white'
            : focused
            ? 'border-brand-500 bg-white ring-2 ring-brand-500/16'
            : 'border-ink-300 bg-white',
        )}
      />
      {error && <p className="mt-1 text-[11px] text-red-700">{error}</p>}
    </div>
  )
}

export default function SettingsPage() {
  const [tab, setTab] = useState<Tab>('profile')
  const user = useAuthStore((s) => s.user)
  const setUser = useAuthStore((s) => s.setUser)
  const { showToast } = useToast()
  const logout = useLogout()

  const profileForm = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name:  user?.name  ?? '',
      email: user?.email ?? '',
      role:  user?.role  ?? '',
    },
  })

  const pwForm = useForm<PwForm>({ resolver: zodResolver(pwSchema) })

  const updateProfile = useMutation({
    mutationFn: (values: ProfileForm) => authApi.updateProfile({ name: values.name }).then((r) => r.data),
    onSuccess: (updated) => {
      setUser(updated)
      showToast({ title: '프로필이 저장되었습니다', kind: 'success' })
    },
    onError: () => showToast({ title: '저장에 실패했습니다', kind: 'error' }),
  })

  const changePassword = useMutation({
    mutationFn: (values: PwForm) =>
      authApi.changePassword({ current_password: values.current, new_password: values.next }),
    onSuccess: () => {
      showToast({ title: '비밀번호가 변경되었습니다. 다시 로그인해주세요.', kind: 'success' })
      pwForm.reset()
      setTimeout(() => logout(), 1500)
    },
    onError: (err: any) => {
      const detail = err?.response?.data?.detail
      if (detail === 'Current password is incorrect.') {
        showToast({ title: '현재 비밀번호가 올바르지 않습니다', kind: 'error' })
      } else {
        showToast({ title: '비밀번호 변경에 실패했습니다', kind: 'error' })
      }
    },
  })

  const TABS: Array<{ id: Tab; label: string; icon: 'user' | 'lock' }> = [
    { id: 'profile',  label: '내 프로필',    icon: 'user' },
    { id: 'password', label: '비밀번호 변경', icon: 'lock' },
  ]

  return (
    <div>
      <div className="px-8 pt-7 pb-5">
        <h1 className="text-2xl font-bold text-ink-800 tracking-tight">설정</h1>
        <p className="text-[13px] text-ink-500 mt-1">계정 및 프로필 정보를 관리합니다</p>
      </div>

      <div className="px-8 pb-8 grid grid-cols-[200px_1fr] gap-5 items-start">
        {/* Tab list */}
        <div className="flex flex-col gap-1">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                'flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[13px] font-medium border-none w-full text-left transition-colors',
                tab === t.id
                  ? 'bg-brand-50 text-brand-700 font-semibold'
                  : 'text-ink-600 hover:bg-ink-50',
              )}
            >
              <Icon name={t.icon} size={15} strokeWidth={1.8} />
              {t.label}
            </button>
          ))}

          <div className="mt-auto pt-6">
            <button
              onClick={logout}
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[13px] font-medium text-red-600 hover:bg-red-50 w-full text-left transition-colors"
            >
              <Icon name="logout" size={15} strokeWidth={1.8} />
              로그아웃
            </button>
          </div>
        </div>

        {/* Profile panel */}
        {tab === 'profile' && (
          <div className="bg-white rounded-xl border border-ink-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-ink-100">
              <h2 className="text-[15px] font-semibold text-ink-800">내 프로필</h2>
              <p className="text-[12px] text-ink-500 mt-0.5">공개 프로필 정보를 관리합니다</p>
            </div>
            <div className="p-6">
              <div className="flex items-center gap-4 mb-6 pb-6 border-b border-ink-100">
                <div
                  className="w-[72px] h-[72px] rounded-full flex items-center justify-center text-[28px] font-bold text-white flex-shrink-0 shadow-md"
                  style={{ background: 'linear-gradient(135deg,#1A3C34 0%,#2D6A4F 70%)' }}
                >
                  {user?.name?.[0] ?? '?'}
                </div>
                <div>
                  <p className="font-semibold text-ink-800">{user?.name}</p>
                  <p className="text-[12px] text-ink-500 mt-0.5">{user?.email}</p>
                </div>
              </div>

              <form
                onSubmit={profileForm.handleSubmit((v) => updateProfile.mutate(v))}
                className="flex flex-col gap-5 max-w-[480px]"
              >
                <InputField
                  label="이름"
                  {...profileForm.register('name')}
                  error={profileForm.formState.errors.name?.message}
                />
                <InputField
                  label="이메일"
                  type="email"
                  disabled
                  {...profileForm.register('email')}
                />
                <InputField
                  label="직함"
                  disabled
                  {...profileForm.register('role')}
                />
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={updateProfile.isPending}
                    className="px-5 py-2 bg-brand-700 text-white rounded-full text-[13px] font-semibold hover:bg-brand-900 transition-colors disabled:opacity-60 disabled:cursor-wait"
                  >
                    {updateProfile.isPending ? '저장 중…' : '변경사항 저장'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Password panel */}
        {tab === 'password' && (
          <div className="bg-white rounded-xl border border-ink-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-ink-100">
              <h2 className="text-[15px] font-semibold text-ink-800">비밀번호 변경</h2>
              <p className="text-[12px] text-ink-500 mt-0.5">
                변경 후 모든 세션이 로그아웃됩니다
              </p>
            </div>
            <div className="p-6">
              <form
                onSubmit={pwForm.handleSubmit((v) => changePassword.mutate(v))}
                className="flex flex-col gap-5 max-w-[480px]"
              >
                <InputField
                  label="현재 비밀번호"
                  type="password"
                  autoComplete="current-password"
                  {...pwForm.register('current')}
                  error={pwForm.formState.errors.current?.message}
                />
                <InputField
                  label="새 비밀번호"
                  type="password"
                  autoComplete="new-password"
                  {...pwForm.register('next')}
                  error={pwForm.formState.errors.next?.message}
                />
                <InputField
                  label="새 비밀번호 확인"
                  type="password"
                  autoComplete="new-password"
                  {...pwForm.register('confirm')}
                  error={pwForm.formState.errors.confirm?.message}
                />
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={changePassword.isPending}
                    className="px-5 py-2 bg-brand-700 text-white rounded-full text-[13px] font-semibold hover:bg-brand-900 transition-colors disabled:opacity-60 disabled:cursor-wait"
                  >
                    {changePassword.isPending ? '변경 중…' : '비밀번호 변경'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
