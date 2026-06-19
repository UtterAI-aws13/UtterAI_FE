import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Icon } from '@/components/common/Icon'

export function AppShell() {
  const today = new Date()
  const dayNames = ['일', '월', '화', '수', '목', '금', '토']
  const todayStr = `${today.getFullYear()}.${String(today.getMonth() + 1).padStart(2, '0')}.${String(today.getDate()).padStart(2, '0')} (${dayNames[today.getDay()]})`

  return (
    <div className="flex h-screen bg-brand-25">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-auto">
        {/* Topbar */}
        <header className="h-14 flex-shrink-0 flex items-center justify-end gap-2 px-8 bg-brand-25 border-b border-ink-100 sticky top-0 z-10">
          <span className="text-[12px] text-ink-500 bg-white border border-ink-200 rounded-full px-3 py-1 mr-auto">
            📅 {todayStr}
          </span>
          <button className="w-8 h-8 rounded-lg flex items-center justify-center text-ink-500 hover:bg-white hover:shadow-sm transition-all">
            <Icon name="bell" size={16} />
          </button>
          <button className="w-8 h-8 rounded-lg flex items-center justify-center text-ink-500 hover:bg-white hover:shadow-sm transition-all">
            <Icon name="search" size={16} />
          </button>
        </header>

        {/* Page content */}
        <main className="flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
