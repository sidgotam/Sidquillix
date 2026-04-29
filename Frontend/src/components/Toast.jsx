import { useEffect, useMemo, useState } from 'react'
import { cn } from '../utils/cn.js'
import { getToasts, removeToast, subscribeToToasts } from '../utils/toastBus.js'

export function ToastViewport() {
  const [items, setItems] = useState(getToasts())

  useEffect(() => {
    return subscribeToToasts((next) => setItems(next))
  }, [])

  const toneStyles = useMemo(
    () => ({
      default:
        'border-white/10 bg-white/[0.08] text-slate-100 shadow-glow backdrop-blur-xl',
      success:
        'border-emerald-400/20 bg-emerald-500/10 text-emerald-50 shadow-glow backdrop-blur-xl',
      danger:
        'border-rose-400/20 bg-rose-500/10 text-rose-50 shadow-glow backdrop-blur-xl',
    }),
    [],
  )

  return (
    <div className="fixed bottom-5 right-5 z-50 flex w-[min(420px,calc(100vw-2.5rem))] flex-col gap-2">
      {items.map((t) => (
        <div
          key={t.id}
          className={cn(
            'rounded-2xl border px-4 py-3 transition',
            toneStyles[t.tone] || toneStyles.default,
          )}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="text-sm font-semibold tracking-tight">{t.title}</div>
              {t.message ? (
                <div className="mt-1 text-sm text-slate-200/90">{t.message}</div>
              ) : null}
            </div>
            <button
              type="button"
              className="rounded-full border border-white/10 bg-white/[0.05] px-2 py-1 text-xs text-slate-200 transition hover:bg-white/[0.08]"
              onClick={() => {
                removeToast(t.id)
              }}
            >
              Close
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}

