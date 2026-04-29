const listeners = new Set()
let toasts = []

function emit() {
  for (const cb of listeners) cb(toasts)
}

export function subscribeToToasts(cb) {
  listeners.add(cb)
  return () => listeners.delete(cb)
}

export function getToasts() {
  return toasts
}

export function pushToast(input) {
  const t = {
    id: crypto.randomUUID?.() || String(Date.now() + Math.random()),
    title: input?.title || 'Notice',
    message: input?.message || '',
    tone: input?.tone || 'default', // default | success | danger
    createdAt: Date.now(),
    ttlMs: input?.ttlMs ?? 3200,
  }

  toasts = [t, ...toasts].slice(0, 4)
  emit()

  window.setTimeout(() => {
    toasts = toasts.filter((x) => x.id !== t.id)
    emit()
  }, t.ttlMs)
}

export function removeToast(id) {
  toasts = toasts.filter((x) => x.id !== id)
  emit()
}

