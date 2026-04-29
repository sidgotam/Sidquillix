import { useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { pushToast as toast } from '../utils/toastBus.js'
import { cn } from '../utils/cn.js'

function ModeTabs({ mode, setMode }) {
  return (
    <div className="flex rounded-2xl border border-white/10 bg-white/[0.04] p-1">
      {[
        { id: 'login', label: 'Login' },
        { id: 'register', label: 'Register' },
      ].map((t) => (
        <button
          key={t.id}
          type="button"
          className={cn(
            'flex-1 rounded-2xl px-3 py-2 text-sm font-semibold transition',
            mode === t.id ? 'bg-white/[0.08] text-white shadow-soft' : 'text-slate-300 hover:bg-white/[0.05]',
          )}
          onClick={() => setMode(t.id)}
        >
          {t.label}
        </button>
      ))}
    </div>
  )
}

export function AuthPage({ auth }) {
  const navigate = useNavigate()
  const location = useLocation()
  const [mode, setMode] = useState('login')
  const [name, setName] = useState('')
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const redirectTo = useMemo(() => {
    const sp = new URLSearchParams(location.search)
    return sp.get('next') || '/'
  }, [location.search])

  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      if (mode === 'login') {
        await auth.login({ email, password })
      } else {
        if (!name.trim()) throw new Error('Name is required')
        if (!username.trim()) throw new Error('Username is required')
        await auth.register({ name: name.trim(), username: username.trim(), email, password })
      }
      navigate(redirectTo)
    } catch (err) {
      const msg = err?.sidquillixMessage || err?.message || 'Something went wrong'
      setError(msg)
      toast({ title: 'Auth failed', message: msg, tone: 'danger' })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="mx-auto grid max-w-4xl gap-5 lg:grid-cols-2 lg:items-stretch">
      <section className="glass-card p-6">
        <div className="text-2xl font-semibold tracking-tight text-slate-50">
          Enter Sidquillix
        </div>
        <div className="mt-1 text-sm text-slate-300/80">
          A premium space for mixed-media expressions.
        </div>

        <div className="mt-5">
          <ModeTabs mode={mode} setMode={setMode} />
        </div>

        <form onSubmit={onSubmit} className="mt-5 space-y-4">
          {mode === 'register' ? (
            <>
              <div>
                <label className="text-sm font-semibold text-slate-50">Name</label>
                <input
                  className="glass-input mt-2"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your display name"
                  autoComplete="name"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-50">Username</label>
                <input
                  className="glass-input mt-2"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Choose a username"
                  autoComplete="username"
                />
              </div>
            </>
          ) : null}

          <div>
            <label className="text-sm font-semibold text-slate-50">Email</label>
            <input
              className="glass-input mt-2"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@domain.com"
              type="email"
              autoComplete="email"
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-slate-50">Password</label>
            <input
              className="glass-input mt-2"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              type="password"
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            />
            <div className="mt-2 text-xs text-slate-400">
              Token is stored in <span className="font-mono">localStorage</span>.
            </div>
          </div>

          {error ? (
            <div className="rounded-2xl border border-rose-400/20 bg-rose-500/10 p-3 text-sm text-rose-100">
              {error}
            </div>
          ) : null}

          <div className="flex items-center justify-between gap-2">
            <button type="button" className="chip transition hover:bg-white/[0.08]" onClick={() => navigate('/')}>
              Back to feed
            </button>
            <button type="submit" className="sidquillix-button disabled:opacity-60" disabled={isSubmitting}>
              {isSubmitting ? 'Please wait…' : mode === 'login' ? 'Login' : 'Create account'}
            </button>
          </div>
        </form>
      </section>

      <section className="glass-card p-6">
        <div className="text-sm font-semibold text-slate-50">What is an expression?</div>
        <div className="mt-2 space-y-3 text-sm text-slate-300/85">
          <p>
            Expressions are <span className="text-slate-50">mixed-media capsules</span>—text, images, video,
            or hybrids.
          </p>
          <p>
            You’re not publishing content. You’re shaping a moment: a thought, a collage, a pulse, a prototype.
          </p>
        </div>
        <div className="mt-5 rounded-2xl border border-white/10 bg-gradient-to-br from-violet-500/10 via-indigo-500/5 to-sky-500/10 p-5">
          <div className="text-sm font-semibold text-slate-50">Design language</div>
          <div className="mt-1 text-sm text-slate-300/80">
            Glass surfaces, soft gradients, rounded cards, and calm motion—premium without being loud.
          </div>
        </div>
      </section>
    </div>
  )
}

