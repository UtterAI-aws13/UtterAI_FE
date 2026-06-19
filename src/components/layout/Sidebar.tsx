import { NavLink } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { Icon } from '@/components/common/Icon'
import { useAuthStore } from '@/store/authStore'
import { useLogout } from '@/hooks/useAuth'

const NAV_ITEMS = [
  { to: '/dashboard', label: '대시보드',  icon: 'grid'     as const },
  { to: '/patients',  label: '환자 관리', icon: 'users'    as const },
  { to: '/sessions',  label: '세션 관리', icon: 'audio'    as const },
  { to: '/reports',   label: '리포트',   icon: 'report'   as const },
  { to: '/templates', label: '템플릿 관리', icon: 'fileText' as const },
]

const UtterWordmark = () => (
  <svg width="18" height="18" viewBox="0 0 64 64" fill="none" aria-hidden>
    <rect x="6"  y="26" width="6" height="12" rx="3" fill="#B7DEC8"/>
    <rect x="16" y="18" width="6" height="28" rx="3" fill="#B7DEC8"/>
    <rect x="26" y="10" width="6" height="44" rx="3" fill="#fff"/>
    <rect x="36" y="16" width="6" height="32" rx="3" fill="#B7DEC8"/>
    <rect x="46" y="24" width="6" height="16" rx="3" fill="#B7DEC8"/>
  </svg>
)

export function Sidebar() {
  const user = useAuthStore((s) => s.user)
  const logout = useLogout()

  const initial = user?.name?.[0] ?? '?'

  return (
    <aside className="w-[248px] flex-shrink-0 bg-white border-r border-ink-200 flex flex-col py-[18px] px-3.5 h-screen sticky top-0">
      {/* Brand */}
      <div className="flex items-center gap-2.5 px-2 pb-[18px]">
        <div className="w-[30px] h-[30px] rounded-lg bg-brand-700 flex items-center justify-center">
          <UtterWordmark />
        </div>
        <span className="text-base font-bold text-brand-700 tracking-tight">UtterAI</span>
      </div>

      {/* Main nav */}
      <p className="text-[10px] font-semibold text-ink-400 tracking-[0.06em] uppercase px-2.5 pt-3 pb-1.5">메인</p>
      {NAV_ITEMS.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) =>
            cn(
              'flex items-center gap-2.5 px-2.5 py-2 rounded-lg mb-0.5',
              'text-[13px] font-medium transition-colors duration-100',
              isActive
                ? 'bg-brand-50 text-brand-700 font-semibold'
                : 'text-ink-600 hover:bg-ink-50',
            )
          }
        >
          <Icon name={item.icon} size={16} />
          {item.label}
        </NavLink>
      ))}

      {/* Management nav */}
      <p className="text-[10px] font-semibold text-ink-400 tracking-[0.06em] uppercase px-2.5 pt-3 pb-1.5">관리</p>
      <NavLink
        to="/settings"
        className={({ isActive }) =>
          cn(
            'flex items-center gap-2.5 px-2.5 py-2 rounded-lg mb-0.5',
            'text-[13px] font-medium transition-colors duration-100',
            isActive
              ? 'bg-brand-50 text-brand-700 font-semibold'
              : 'text-ink-600 hover:bg-ink-50',
          )
        }
      >
        <Icon name="settings" size={16} />
        설정
      </NavLink>

      {/* Footer */}
      <div className="mt-auto flex items-center gap-2.5 px-2 pt-2.5 border-t border-ink-100">
        <div className="w-8 h-8 rounded-full bg-brand-200 text-brand-700 flex items-center justify-center text-xs font-bold flex-shrink-0">
          {initial}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[12px] font-semibold text-ink-800 truncate">
            {user?.name} <span className="font-normal text-ink-500">{user?.role}</span>
          </p>
          <p className="text-[10px] text-ink-500 truncate">{user?.email}</p>
        </div>
        <button
          onClick={logout}
          title="로그아웃"
          className="w-6.5 h-6.5 rounded-md flex items-center justify-center text-ink-400 hover:bg-red-50 hover:text-red-700 transition-colors flex-shrink-0 ml-0.5"
        >
          <Icon name="logout" size={13} />
        </button>
      </div>
    </aside>
  )
}
