import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useTheme } from '../hooks/useTheme.js'
import { cn } from '../utils/cn.js'

function BrandMark() {
  return (
    <div className="h-10 w-10 overflow-hidden rounded-xl border border-white/10 shadow-soft bg-night/50">
      <img src="/logo.png" alt="Sidquillix" className="h-full w-full object-cover" />
    </div>
  )
}

function ProfileAvatar({ src }) {
  const [broken, setBroken] = useState(false)
  const cleanedSrc = typeof src === 'string' ? src.trim() : ''

  if (cleanedSrc && !broken) {
    return (
      <img
        src={cleanedSrc}
        alt="Profile"
        className="h-9 w-9 rounded-full border border-white/20 object-cover"
        onError={() => setBroken(true)}
      />
    )
  }

  return (
    <div className="grid h-9 w-9 place-items-center rounded-full border border-white/20 bg-white/[0.08] text-slate-200">
      <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden="true">
        <path d="M12 12a5 5 0 1 0-5-5 5 5 0 0 0 5 5zm0 2c-4.42 0-8 2.24-8 5v1h16v-1c0-2.76-3.58-5-8-5z" />
      </svg>
    </div>
  )
}

export function Navbar({ auth }) {
  const navigate = useNavigate()
  const { theme, toggle } = useTheme()

  const linkClass = ({ isActive }) =>
    cn(
      'rounded-full px-3 py-1.5 text-sm font-medium transition',
      isActive
        ? 'bg-white/[0.08] text-white shadow-soft'
        : 'text-slate-200/90 hover:bg-white/[0.06] hover:text-white',
    )

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-night/60 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-4 py-3 md:px-6">
        <Link to="/" className="group flex items-center gap-3">
          <BrandMark />
          <div className="leading-tight">
            <div className="text-sm font-semibold tracking-tight text-slate-50">
              Sidquillix
            </div>
            <div className="text-xs text-slate-300/80">Express Everything</div>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          <NavLink to="/" className={linkClass} end>
            Feed
          </NavLink>
          <NavLink to="/create" className={linkClass}>
            Create
          </NavLink>
          <NavLink to="/profile" className={linkClass}>
            Profile
          </NavLink>
        </nav>

        <div className="flex items-center gap-2">
          <button type="button" className="chip transition hover:bg-white/[0.08]" onClick={toggle}>
            <span
              className={cn(
                'h-2.5 w-2.5 rounded-full',
                theme === 'dark' ? 'bg-violet-400' : 'bg-sky-300',
              )}
            />
            {theme === 'dark' ? 'Dark' : 'Light'}
          </button>

          {auth?.isAuthed ? (
            <button
              type="button"
              className="rounded-full transition hover:scale-[1.02]"
              onClick={() => navigate('/profile')}
              aria-label="Open profile"
            >
              <ProfileAvatar src={auth?.me?.profilePicture} />
            </button>
          ) : (
            <button type="button" className="sidquillix-button" onClick={() => navigate('/auth')}>
              Sign in
            </button>
          )}
        </div>
      </div>

      <div className="mx-auto w-full max-w-6xl px-4 pb-3 md:hidden md:px-6">
        <nav className="flex items-center gap-2 overflow-x-auto">
          <NavLink to="/" className={linkClass} end>
            Feed
          </NavLink>
          <NavLink to="/create" className={linkClass}>
            Create
          </NavLink>
          <NavLink to="/profile" className={linkClass}>
            Profile
          </NavLink>
        </nav>
      </div>
    </header>
  )
}

