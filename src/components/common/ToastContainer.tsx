import { useToastStore } from '@/store/toastStore'
import { Icon } from './Icon'
import { cn } from '@/lib/utils'

export function ToastContainer() {
  const { toasts, dismiss } = useToastStore()

  if (toasts.length === 0) return null

  return (
    <div className="fixed top-5 right-6 z-50 flex flex-col gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={cn(
            'flex items-start gap-3 p-3 bg-white rounded-xl max-w-[340px]',
            'shadow-lg border border-brand-100',
            'animate-[slideIn_200ms_cubic-bezier(0.22,1,0.36,1)]',
          )}
        >
          <div
            className={cn(
              'w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0',
              toast.kind === 'error' ? 'bg-red-100 text-red-700' : 'bg-brand-100 text-brand-700',
            )}
          >
            <Icon name={toast.kind === 'error' ? 'alert' : 'check'} size={13} strokeWidth={3} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-semibold text-ink-800">{toast.title}</p>
            {toast.body && (
              <p className="text-[12px] text-ink-500 mt-0.5">{toast.body}</p>
            )}
          </div>
          <button
            onClick={() => dismiss(toast.id)}
            className="text-ink-400 hover:text-ink-600 flex-shrink-0 mt-0.5"
          >
            <Icon name="x" size={13} />
          </button>
        </div>
      ))}
    </div>
  )
}
