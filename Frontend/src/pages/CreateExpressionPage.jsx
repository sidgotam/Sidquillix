import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createExpression } from '../api/expressions.js'
import { ExpressionCard } from '../components/ExpressionCard.jsx'
import { MediaUploader } from '../components/MediaUploader.jsx'
import { pushToast as toast } from '../utils/toastBus.js'

const MOODS = ['motivated', 'thoughtful', 'emotional', 'casual', 'trending']

export function CreateExpressionPage() {
  const navigate = useNavigate()
  const [createdAt] = useState(() => Date.now())
  const [text, setText] = useState('')
  const [mood, setMood] = useState('Curious')
  const [files, setFiles] = useState([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const preview = useMemo(() => {
    const images = files.filter((f) => f.type.startsWith('image/')).map((f) => URL.createObjectURL(f))
    const videoFile = files.find((f) => f.type.startsWith('video/'))
    const video = videoFile ? URL.createObjectURL(videoFile) : null

    return {
      id: 'preview',
      createdAt,
      mood,
      author: { name: 'You', handle: 'me' },
      text,
      media: { images, video },
      likedByMe: false,
      likeCount: 0,
      contentType: video ? 'video' : images.length ? 'image' : text ? 'text' : 'hybrid',
    }
  }, [createdAt, files, mood, text])

  useEffect(() => {
    const urls = [
      ...(preview?.media?.images || []),
      ...(preview?.media?.video ? [preview.media.video] : []),
    ]
    return () => urls.forEach((u) => URL.revokeObjectURL(u))
  }, [preview])

  async function onSubmit(e) {
    e.preventDefault()
    if (!text.trim() && !files.length) {
      toast({ title: 'Empty expression', message: 'Add text or media first.', tone: 'danger' })
      return
    }

    setIsSubmitting(true)
    try {
      const fd = new FormData()
      fd.append('text', text)
      fd.append('mood', mood)
      for (const f of files) fd.append('media', f)

      await createExpression(fd)
      toast({ title: 'Posted', message: 'Your expression is live.', tone: 'success' })
      navigate('/')
    } catch (err) {
      toast({
        title: 'Couldn’t post',
        message: err?.sidquillixMessage || 'API unreachable. Expression not saved.',
        tone: 'danger',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="grid gap-5 lg:grid-cols-2 lg:items-start">
      <section className="glass-card p-6">
        <div className="text-2xl font-semibold tracking-tight text-slate-50">
          Create an expression
        </div>
        <div className="mt-1 text-sm text-slate-300/80">
          Blend text, images, and video. Let the mood lead.
        </div>

        <form onSubmit={onSubmit} className="mt-5 space-y-4">
          <div>
            <label className="text-sm font-semibold text-slate-50">Text</label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={6}
              placeholder="Write anything—short, long, poetic, technical, raw…"
              className="glass-input mt-2 resize-none"
            />
            <div className="mt-2 text-xs text-slate-400">
              Tip: Use line breaks—expressions look great with rhythm.
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold text-slate-50">Mood</label>
            <div className="mt-2 flex flex-wrap gap-2">
              {MOODS.map((m) => (
                <button
                  key={m}
                  type="button"
                  className={[
                    'chip transition hover:bg-white/[0.08]',
                    mood === m ? 'border-white/20 bg-white/[0.09] text-white' : '',
                  ].join(' ')}
                  onClick={() => setMood(m)}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between gap-2">
            <button type="button" className="chip transition hover:bg-white/[0.08]" onClick={() => navigate(-1)}>
              Back
            </button>
            <button type="submit" className="sidquillix-button disabled:opacity-60" disabled={isSubmitting}>
              {isSubmitting ? 'Posting…' : 'Post expression'}
            </button>
          </div>
        </form>
      </section>

      <div className="space-y-5">
        <MediaUploader files={files} onChange={setFiles} />

        <section className="glass-card p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-sm font-semibold text-slate-50">Preview</div>
              <div className="mt-1 text-sm text-slate-300/80">
                This is how your expression will feel in the feed.
              </div>
            </div>
          </div>

          <div className="mt-4">
            <ExpressionCard expression={preview} onToggleLike={() => {}} />
          </div>
        </section>
      </div>
    </div>
  )
}

