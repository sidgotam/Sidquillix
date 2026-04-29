import { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { cn } from '../utils/cn.js'
import { createComment, listComments } from '../api/comments.js'
import { pushToast as toast } from '../utils/toastBus.js'

function MoodPill({ mood }) {
  const styles = useMemo(() => {
    const map = {
      Calm: 'from-sky-400/30 to-indigo-400/10 text-sky-100',
      Hype: 'from-rose-400/30 to-violet-400/10 text-rose-100',
      Reflect: 'from-indigo-400/30 to-slate-400/10 text-indigo-100',
      Curious: 'from-emerald-400/30 to-sky-400/10 text-emerald-100',
      Bold: 'from-amber-400/30 to-rose-400/10 text-amber-100',
      Dreamy: 'from-violet-400/30 to-sky-400/10 text-violet-100',
    }
    return map[mood] || 'from-white/15 to-white/5 text-slate-100'
  }, [mood])

  return (
    <span
      className={cn(
        'inline-flex items-center gap-2 rounded-full border border-white/10 bg-gradient-to-r px-3 py-1 text-xs font-semibold',
        styles,
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-white/70" />
      {mood || 'Moodless'}
    </span>
  )
}

function MediaGrid({ images }) {
  if (!images?.length) return null

  const cols = images.length === 1 ? 'grid-cols-1' : images.length === 2 ? 'grid-cols-2' : 'grid-cols-3'

  return (
    <div className={cn('mt-4 grid gap-2 overflow-hidden rounded-2xl', cols)}>
      {images.slice(0, 6).map((src, idx) => (
        <div
          key={`${src}_${idx}`}
          className={cn(
            'relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]',
            images.length === 1 ? 'aspect-[16/9]' : 'aspect-square',
          )}
        >
          <img
            src={src}
            alt=""
            loading="lazy"
            className="h-full w-full object-cover transition duration-500 hover:scale-[1.02]"
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
        </div>
      ))}
    </div>
  )
}

function VideoPlayer({ src }) {
  if (!src) return null
  return (
    <div className="mt-4 overflow-hidden rounded-2xl border border-white/10 bg-black/30">
      <video
        className="aspect-video w-full"
        src={src}
        controls
        preload="metadata"
        playsInline
      />
    </div>
  )
}

export function ExpressionCard({ expression, onToggleLike, isTogglingLike }) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isReadingFull, setIsReadingFull] = useState(false)
  const [showComments, setShowComments] = useState(false)
  const [comments, setComments] = useState([])
  const [isLoadingComments, setIsLoadingComments] = useState(false)
  const [commentText, setCommentText] = useState('')
  const [isPostingComment, setIsPostingComment] = useState(false)

  const text = expression?.text || ''
  const images = expression?.media?.images || expression?.images || []
  const video = expression?.media?.video || expression?.video || null

  const shouldClamp = text.length > 260 && !isExpanded
  const isLongArticle = text.length > 700
  const isLongCaptionForMedia = (images?.length > 0 || video) && text.length > 260
  const shouldUseModal = isLongArticle || isLongCaptionForMedia
  const createdLabel = expression?.createdAt
    ? new Date(expression.createdAt).toLocaleString(undefined, {
        month: 'short',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      })
    : ''

  useEffect(() => {
    if (!isReadingFull) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [isReadingFull])

  useEffect(() => {
    if (!isReadingFull) return
    function onKeyDown(e) {
      if (e.key === 'Escape') setIsReadingFull(false)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [isReadingFull])

  async function loadComments() {
    if (!expression?.id || isLoadingComments) return
    setIsLoadingComments(true)
    try {
      const data = await listComments(expression.id, { page: 1, limit: 20 })
      setComments(data?.comments || [])
    } catch (err) {
      toast({
        title: 'Could not load comments',
        message: err?.sidquillixMessage || 'Try again in a moment.',
        tone: 'danger',
      })
    } finally {
      setIsLoadingComments(false)
    }
  }

  async function onSubmitComment(e) {
    e.preventDefault()
    const text = commentText.trim()
    if (!text) return
    if (!localStorage.getItem('sidquillix_token')) {
      toast({ title: 'Login required', message: 'Please login to comment.', tone: 'default' })
      return
    }

    setIsPostingComment(true)
    try {
      const comment = await createComment({ expressionId: expression.id, text })
      if (comment) setComments((prev) => [comment, ...prev])
      setCommentText('')
    } catch (err) {
      toast({
        title: 'Could not post comment',
        message: err?.sidquillixMessage || 'Try again in a moment.',
        tone: 'danger',
      })
    } finally {
      setIsPostingComment(false)
    }
  }

  return (
    <article className="glass-card p-5 transition hover:-translate-y-[1px] hover:border-white/15">
      <header className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <div className="text-sm font-semibold text-slate-50">
              {expression?.author?.name || 'Anonymous'}
            </div>
            {expression?.author?.handle ? (
              <div className="text-xs text-slate-400">@{expression.author.handle}</div>
            ) : null}
            {createdLabel ? <div className="text-xs text-slate-500">· {createdLabel}</div> : null}
          </div>
          <div className="mt-2">
            <MoodPill mood={expression?.mood} />
          </div>
        </div>

        <button
          type="button"
          className={cn(
            'inline-flex items-center gap-2 rounded-2xl border px-3 py-2 text-sm font-medium transition',
            expression?.likedByMe
              ? 'border-rose-400/20 bg-rose-500/10 text-rose-100'
              : 'border-white/10 bg-white/[0.04] text-slate-200 hover:bg-white/[0.07]',
            isTogglingLike ? 'opacity-60' : '',
          )}
          disabled={isTogglingLike}
          onClick={() => onToggleLike?.(expression)}
        >
          <span className={cn('h-2 w-2 rounded-full', expression?.likedByMe ? 'bg-rose-300' : 'bg-slate-300')} />
          Like
          <span className="text-slate-300/70">{expression?.likeCount ?? 0}</span>
        </button>
      </header>

      {isReadingFull
        ? createPortal(
            <div
              role="dialog"
              aria-modal="true"
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
              onMouseDown={(e) => {
                if (e.target === e.currentTarget) setIsReadingFull(false)
              }}
            >
              <div className="glass-card relative flex w-full max-w-3xl flex-col overflow-hidden bg-night/95">
                <button
                  type="button"
                  className="absolute right-3 top-3 inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.06] text-slate-200 transition hover:bg-white/[0.1]"
                  onClick={() => setIsReadingFull(false)}
                  aria-label="Close"
                >
                  <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden="true">
                    <path d="M18.3 5.71a1 1 0 0 0-1.41 0L12 10.59 7.11 5.7A1 1 0 0 0 5.7 7.11L10.59 12 5.7 16.89a1 1 0 1 0 1.41 1.41L12 13.41l4.89 4.89a1 1 0 0 0 1.41-1.41L13.41 12l4.89-4.89a1 1 0 0 0 0-1.4z" />
                  </svg>
                </button>

                <div className="border-b border-white/10 p-4 pr-14">
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-slate-50">{expression?.author?.name || 'Anonymous'}</div>
                    <div className="mt-0.5 text-xs text-slate-400">
                      {expression?.author?.handle ? `@${expression.author.handle}` : ''}
                      {createdLabel ? ` · ${createdLabel}` : ''}
                    </div>
                  </div>
                </div>

                <div className="max-h-[calc(100vh-8rem)] flex-1 overflow-auto bg-white/[0.03] p-5">
                  <div className="mb-4">
                    <MoodPill mood={expression?.mood} />
                  </div>

                  {text ? (
                    <p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-slate-100/90">{text}</p>
                  ) : null}

                  <MediaGrid images={images} />
                  <VideoPlayer src={video} />
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}

      {text ? (
        <div className="mt-4">
          <div className={cn('relative', shouldClamp ? 'max-h-24 overflow-hidden' : '')}>
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-100/90">{text}</p>
            {shouldClamp ? (
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-night/90 via-night/40 to-transparent" />
            ) : null}
          </div>
          {shouldUseModal ? (
            <button
              type="button"
              className="mt-2 text-sm font-medium text-violet-200/90 transition hover:text-violet-100"
              onClick={() => setIsReadingFull(true)}
            >
              {isLongCaptionForMedia ? 'View full caption' : 'Read full article'}
            </button>
          ) : text.length > 260 ? (
            <button
              type="button"
              className="mt-2 text-sm font-medium text-violet-200/90 transition hover:text-violet-100"
              onClick={() => setIsExpanded((v) => !v)}
            >
              {isExpanded ? 'Show less' : 'Unfold'}
            </button>
          ) : null}
        </div>
      ) : null}

      <MediaGrid images={images} />
      <VideoPlayer src={video} />

      <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.03] p-3">
        <button
          type="button"
          className="text-sm font-medium text-slate-200 transition hover:text-white"
          onClick={async () => {
            const next = !showComments
            setShowComments(next)
            if (next && comments.length === 0) await loadComments()
          }}
        >
          {showComments ? 'Hide comments' : 'Show comments'}
        </button>

        {showComments ? (
          <div className="mt-3 space-y-3">
            <form onSubmit={onSubmitComment} className="flex gap-2">
              <input
                className="glass-input"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Write a comment..."
                maxLength={500}
              />
              <button type="submit" className="chip" disabled={isPostingComment}>
                {isPostingComment ? 'Posting...' : 'Post'}
              </button>
            </form>

            {isLoadingComments ? (
              <div className="text-sm text-slate-400">Loading comments...</div>
            ) : comments.length ? (
              <div className="space-y-2">
                {comments.map((c) => (
                  <div key={c.id} className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2">
                    <div className="text-xs text-slate-400">{c.author?.name || 'Anonymous'}</div>
                    <div className="text-sm text-slate-200">{c.text}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-slate-400">No comments yet.</div>
            )}
          </div>
        ) : null}
      </div>
    </article>
  )
}

