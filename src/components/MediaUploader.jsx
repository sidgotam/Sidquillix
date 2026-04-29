import { useEffect, useMemo, useRef } from 'react'
import { cn } from '../utils/cn.js'

function fileToPreview(file) {
  const url = URL.createObjectURL(file)
  const kind = file.type.startsWith('video/') ? 'video' : file.type.startsWith('image/') ? 'image' : 'other'
  return { url, kind, name: file.name, size: file.size }
}

export function MediaUploader({ files, onChange }) {
  const inputRef = useRef(null)

  const previews = useMemo(() => (files || []).map(fileToPreview), [files])

  useEffect(() => {
    return () => {
      for (const p of previews) URL.revokeObjectURL(p.url)
    }
  }, [previews])

  const openPicker = () => inputRef.current?.click()

  return (
    <div className="glass-card p-5">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="text-sm font-semibold text-slate-50">Media</div>
          <div className="mt-1 text-sm text-slate-300/80">
            Add images and videos—mix them freely.
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" className="sidquillix-button" onClick={openPicker}>
            Upload
          </button>
          <button
            type="button"
            className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-medium text-slate-200 transition hover:bg-white/[0.07] disabled:opacity-50"
            disabled={!files?.length}
            onClick={() => onChange([])}
          >
            Clear
          </button>
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        className="hidden"
        multiple
        accept="image/*,video/*"
        onChange={(e) => {
          const list = Array.from(e.target.files || [])
          onChange([...(files || []), ...list])
          e.target.value = ''
        }}
      />

      {previews.length ? (
        <div className="mt-4 grid grid-cols-2 gap-2 md:grid-cols-3">
          {previews.map((p, idx) => (
            <div
              key={`${p.url}_${idx}`}
              className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]"
            >
              {p.kind === 'image' ? (
                <img src={p.url} alt="" className="aspect-square w-full object-cover" />
              ) : p.kind === 'video' ? (
                <video
                  src={p.url}
                  className="aspect-square w-full object-cover"
                  muted
                  playsInline
                  preload="metadata"
                />
              ) : (
                <div className="aspect-square w-full p-4 text-sm text-slate-200">
                  {p.name}
                </div>
              )}

              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 transition group-hover:opacity-100" />
              <button
                type="button"
                className={cn(
                  'absolute right-2 top-2 rounded-full border border-white/10 bg-white/[0.08] px-2 py-1 text-xs text-slate-100 opacity-0 transition',
                  'group-hover:opacity-100',
                )}
                onClick={() => {
                  const next = [...(files || [])]
                  next.splice(idx, 1)
                  onChange(next)
                }}
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-4 rounded-2xl border border-dashed border-white/15 bg-white/[0.03] p-6 text-sm text-slate-300/80">
          Drop a vibe here: images, clips, or both.
        </div>
      )}
    </div>
  )
}

