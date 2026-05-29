import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { authApi, type LoginPayload, type SignupPayload } from '@/api/auth'
import { useAuthStore } from '@/store/authStore'
import { useToastStore } from '@/store/toastStore'

export function useLogin() {
  const { setTokens, setUser } = useAuthStore()
  const { showToast } = useToastStore()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: (payload: LoginPayload) => authApi.login(payload),
    onSuccess: ({ data }) => {
      setTokens(data.access, data.refresh)
      setUser(data.user)
      showToast({
        title: `환영합니다, ${data.user.name} 선생님`,
        body: '오늘 세션을 확인해보세요.',
        kind: 'success',
      })
      navigate('/dashboard')
    },
    onError: () => {
      showToast({ title: '로그인에 실패했습니다', body: '이메일 또는 비밀번호를 확인해주세요.', kind: 'error' })
    },
  })
}

export function useSignup() {
  const { setTokens, setUser } = useAuthStore()
  const { showToast } = useToastStore()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: (payload: SignupPayload) => authApi.signup(payload),
    onSuccess: ({ data }) => {
      setTokens(data.access, data.refresh)
      setUser(data.user)
      showToast({ title: '계정이 생성되었습니다', body: '환영합니다!', kind: 'success' })
      navigate('/dashboard')
    },
    onError: () => {
      showToast({ title: '회원가입에 실패했습니다', body: '입력 정보를 다시 확인해주세요.', kind: 'error' })
    },
  })
}

export function useLogout() {
  const { logout } = useAuthStore()
  const navigate = useNavigate()

  return () => {
    logout()
    navigate('/login')
  }
}
