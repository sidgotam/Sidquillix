import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { listExpressions } from '../api/expressions.js'
import { toggleLike } from '../api/likes.js'
import { ExpressionCard } from '../components/ExpressionCard.jsx'
import { ExpressionCardSkeleton } from '../components/Skeletons.jsx'
import { pushToast as toast } from '../utils/toastBus.js'
import { cn } from '../utils/cn.js'
import { makeMockExpressions } from '../utils/mockExpressions.js'

const MOODS = ['All', 'motivated', 'thoughtful', 'emotional', 'casual', 'trending']
const TYPES = ['All', 'text', 'image', 'video', 'hybrid']

function FilterRow({ label, value, options, onChange }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
        {label}
      </div>
      {options.map((opt) => (
        <button
          key={opt}
          type="button"
          className={cn(
            'chip transition hover:bg-white/[0.08]',
            value === opt ? 'border-white/20 bg-white/[0.09] text-white' : '',
          )}
          onClick={() => onChange(opt)}
        >
          {opt}
        </button>
      ))}
    </div>
  )
}

export function HomePage() {
  const [mood, setMood] = useState('All')
  const [type, setType] = useState('All')

  const [items, setItems] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [page, setPage] = useState(1)
  const [likeBusyId, setLikeBusyId] = useState(null)

  const sentinelRef = useRef(null)
  const [isMock, setIsMock] = useState(false)

  const filtered = useMemo(() => {
    return (items || []).filter((x) => {
      const moodOk = mood === 'All' ? true : x.mood === mood
      const typeOk = type === 'All' ? true : x.contentType === type
      return moodOk && typeOk
    })
  }, [items, mood, type])

  const loadFirst = useCallback(async () => {
    setIsLoading(true)
    setHasMore(true)
    setPage(1)
    setIsMock(false)

    try {
      const data = await listExpressions({ page: 1, limit: 10 })
      const list = data?.items || data?.expressions || data || []
      setItems(Array.isArray(list) ? list : [])
      setHasMore(Boolean(data?.hasMore ?? (Array.isArray(list) && list.length >= 10)))
    } catch (err) {
      setIsMock(true)
      setItems(makeMockExpressions(22))
      setHasMore(false)
      toast({
        title: 'Offline mode',
        message: err?.sidquillixMessage || 'Could not reach API. Showing mock feed.',
        tone: 'default',
        ttlMs: 4200,
      })
    } finally {
      setIsLoading(false)
    }
  }, [])

  const loadMore = useCallback(async () => {
    if (!hasMore || isLoadingMore || isLoading || isMock) return
    setIsLoadingMore(true)
    const nextPage = page + 1

    try {
      const data = await listExpressions({ page: nextPage, limit: 10 })
      const list = data?.items || data?.expressions || data || []
      const next = Array.isArray(list) ? list : []
      setItems((prev) => [...prev, ...next])
      setHasMore(Boolean(data?.hasMore ?? next.length >= 10))
      setPage(nextPage)
    } catch (err) {
      setHasMore(false)
      toast({
        title: 'Couldn’t load more',
        message: err?.sidquillixMessage || 'Try again in a moment.',
        tone: 'danger',
      })
    } finally {
      setIsLoadingMore(false)
    }
  }, [hasMore, isLoading, isLoadingMore, isMock, page])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadFirst()
  }, [loadFirst])

  useEffect(() => {
    const el = sentinelRef.current
    if (!el) return

    const obs = new IntersectionObserver(
      (entries) => {
        const first = entries[0]
        if (first?.isIntersecting) loadMore()
      },
      { rootMargin: '800px 0px' },
    )

    obs.observe(el)
    return () => obs.disconnect()
  }, [loadMore])

  return (
    <div className="space-y-5">
      <section className="glass-card overflow-hidden">
        <div className="p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="text-2xl font-semibold tracking-tight text-slate-50">
                Feed of Expressions
              </div>
              <div className="mt-1 max-w-xl text-sm text-slate-300/80">
                Not posts. Not uploads. Just expressive fragments—text, visuals, motion… or all at once.
              </div>
            </div>
            <button type="button" className="sidquillix-button" onClick={loadFirst}>
              Refresh
            </button>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-2">
            <FilterRow label="Mood" value={mood} options={MOODS} onChange={setMood} />
            <FilterRow label="Type" value={type} options={TYPES} onChange={setType} />
          </div>
        </div>

        <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />

        <div className="p-6">
          {isLoading ? (
            <div className="grid gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <ExpressionCardSkeleton key={i} />
              ))}
            </div>
          ) : filtered.length ? (
            <div className="grid gap-4">
              {filtered.map((expression) => (
                <ExpressionCard
                  key={expression.id}
                  expression={expression}
                  isTogglingLike={likeBusyId === expression.id}
                  onToggleLike={async (e) => {
                    setLikeBusyId(e.id)
                    const previous = items
                    const optimisticLiked = !e.likedByMe
                    const optimisticLikes = Math.max(0, (e.likeCount || 0) + (e.likedByMe ? -1 : 1))

                    setItems((prev) =>
                      prev.map((x) =>
                        x.id !== e.id
                          ? x
                          : {
                              ...x,
                              likedByMe: optimisticLiked,
                              likeCount: optimisticLikes,
                            },
                      ),
                    )

                    try {
                      const data = await toggleLike(e.id)
                      setItems((prev) =>
                        prev.map((x) =>
                          x.id !== e.id
                            ? x
                            : {
                                ...x,
                                likedByMe: data.liked,
                                likeCount: data.likes,
                              },
                        ),
                      )
                    } catch (err) {
                      setItems(previous)
                      toast({
                        title: 'Could not update like',
                        message: err?.sidquillixMessage || 'Please try again.',
                        tone: 'danger',
                      })
                    } finally {
                      setLikeBusyId(null)
                    }
                  }}
                />
              ))}

              {isLoadingMore ? (
                <div className="grid gap-4">
                  {Array.from({ length: 2 }).map((_, i) => (
                    <ExpressionCardSkeleton key={`more_${i}`} />
                  ))}
                </div>
              ) : null}

              <div ref={sentinelRef} />
              {!hasMore && !isMock ? (
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm text-slate-300/80">
                  You’re at the edge of the feed.
                </div>
              ) : null}
            </div>
          ) : (
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
              <div className="text-sm font-semibold text-slate-50">No expressions found</div>
              <div className="mt-1 text-sm text-slate-300/80">
                Try changing filters—or be the first to express something.
              </div>
            </div>
          )}
        </div>
      </section>

    </div>
  )
}

