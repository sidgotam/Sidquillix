import { useEffect, useMemo, useState } from 'react'
import { deleteExpression, listMyExpressions, updateExpression } from '../api/expressions.js'
import { toggleLike } from '../api/likes.js'
import { ExpressionCard } from '../components/ExpressionCard.jsx'
import { ExpressionCardSkeleton } from '../components/Skeletons.jsx'
import { pushToast as toast } from '../utils/toastBus.js'

export function ProfilePage({ auth }) {
  const [isLoading, setIsLoading] = useState(true)
  const [items, setItems] = useState([])
  const [likeBusyId, setLikeBusyId] = useState(null)
  const [name, setName] = useState('')
  const [username, setUsername] = useState('')
  const [bio, setBio] = useState('')
  const [profilePictureFile, setProfilePictureFile] = useState(null)
  const [profilePreviewUrl, setProfilePreviewUrl] = useState('')
  const [isSavingProfile, setIsSavingProfile] = useState(false)
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [deletingId, setDeletingId] = useState(null)
  const [editingId, setEditingId] = useState(null)

  const user = useMemo(() => {
    const me = auth?.me
    return {
      name: me?.name || 'You',
      handle: me?.username || 'me',
      bio: me?.bio || 'A small universe of expressions—text, pixels, motion.',
      profilePicture: me?.profilePicture || '',
    }
  }, [auth?.me])

  useEffect(() => {
    setName(user.name)
    setUsername(user.handle)
    setBio(user.bio)
  }, [user.handle, user.name, user.bio])

  useEffect(() => {
    if (!profilePictureFile) {
      setProfilePreviewUrl('')
      return
    }
    const url = URL.createObjectURL(profilePictureFile)
    setProfilePreviewUrl(url)
    return () => URL.revokeObjectURL(url)
  }, [profilePictureFile])

  function startEditProfile() {
    setName(user.name)
    setUsername(user.handle)
    setBio(user.bio)
    setProfilePictureFile(null)
    setIsEditingProfile(true)
  }

  function cancelEditProfile() {
    setName(user.name)
    setUsername(user.handle)
    setBio(user.bio)
    setProfilePictureFile(null)
    setIsEditingProfile(false)
  }

  useEffect(() => {
    async function run() {
      setIsLoading(true)
      try {
        const data = await listMyExpressions({ page: 1, limit: 24 })
        const list = data?.items || data?.expressions || data || []
        setItems(Array.isArray(list) ? list : [])
      } catch (err) {
        setItems([])
        toast({
          title: 'Could not load profile posts',
          message: err?.sidquillixMessage || 'Please try again in a moment.',
          tone: 'danger',
          ttlMs: 3800,
        })
      } finally {
        setIsLoading(false)
      }
    }

    run()
  }, [user.handle, user.name])

  async function onSaveProfile(e) {
    e.preventDefault()
    if (!auth?.updateProfile) return

    setIsSavingProfile(true)
    try {
      await auth.updateProfile({ name: name.trim(), username: username.trim(), bio: bio.trim(), profilePicture: profilePictureFile })
      setProfilePictureFile(null)
      setIsEditingProfile(false)
    } catch (err) {
      toast({
        title: 'Profile update failed',
        message: err?.sidquillixMessage || err?.message || 'Please try again.',
        tone: 'danger',
      })
    } finally {
      setIsSavingProfile(false)
    }
  }

  async function onDeletePost(expressionId) {
    const ok = window.confirm('Delete this expression? This cannot be undone.')
    if (!ok) return

    setDeletingId(expressionId)
    try {
      await deleteExpression(expressionId)
      setItems((prev) => prev.filter((x) => x.id !== expressionId))
      toast({ title: 'Deleted', message: 'Expression deleted successfully.', tone: 'success' })
    } catch (err) {
      toast({
        title: 'Delete failed',
        message: err?.sidquillixMessage || 'Please try again.',
        tone: 'danger',
      })
    } finally {
      setDeletingId(null)
    }
  }

  async function onEditPost(expression) {
    const nextText = window.prompt('Edit your expression text', expression?.text || '')
    if (nextText === null) return

    setEditingId(expression.id)
    try {
      const updated = await updateExpression(expression.id, {
        text: nextText,
      })
      if (updated) {
        setItems((prev) => prev.map((x) => (x.id === expression.id ? { ...x, ...updated } : x)))
      }
      toast({ title: 'Updated', message: 'Expression updated successfully.', tone: 'success' })
    } catch (err) {
      toast({
        title: 'Update failed',
        message: err?.sidquillixMessage || 'Please try again.',
        tone: 'danger',
      })
    } finally {
      setEditingId(null)
    }
  }

  return (
    <div className="space-y-5">
      <section className="glass-card overflow-hidden">
        <div className="p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              {profilePreviewUrl ? (
                <img
                  src={profilePreviewUrl}
                  alt="Profile preview"
                  className="mb-3 h-16 w-16 rounded-full border border-white/15 object-cover opacity-60 contrast-75 brightness-75 blur-[1px]"
                />
              ) : user.profilePicture ? (
                <img
                  src={user.profilePicture}
                  alt="Profile"
                  className="mb-3 h-16 w-16 rounded-full border border-white/15 object-cover"
                />
              ) : null}
              <div className="text-2xl font-semibold tracking-tight text-slate-50">
                {user.name}
              </div>
              <div className="mt-1 text-sm text-slate-300/80">@{user.handle}</div>
              <div className="mt-3 max-w-2xl text-sm text-slate-300/85">{user.bio}</div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-violet-500/10 via-indigo-500/5 to-sky-500/10 p-4">
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-300/80">
                Your posts
              </div>
              <div className="mt-1 text-2xl font-semibold text-slate-50">
                {isLoading ? '—' : items.length}
              </div>
            </div>
          </div>
        </div>

        <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />

        <div className="p-6">
          {!isEditingProfile ? (
            <div className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <div>
                <div className="text-sm font-semibold text-slate-50">Profile Settings</div>
                <div className="mt-1 text-sm text-slate-300/80">
                  Update your name, username, and optional profile picture.
                </div>
              </div>
              <button type="button" className="sidquillix-button" onClick={startEditProfile}>
                Edit profile
              </button>
            </div>
          ) : (
            <form onSubmit={onSaveProfile} className="space-y-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <div className="grid gap-3 md:grid-cols-2">
                <div>
                  <label className="text-sm font-semibold text-slate-50">Name</label>
                  <input
                    className="glass-input mt-2"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your display name"
                    minLength={2}
                    maxLength={50}
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-50">Username</label>
                  <input
                    className="glass-input mt-2"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter username"
                    minLength={2}
                    maxLength={30}
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-50">Bio</label>
                <textarea
                  className="glass-input mt-2 min-h-[80px]"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell us about yourself..."
                  maxLength={160}
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-50">Profile picture (optional)</label>
                <input
                  className="mt-2 block w-full text-sm text-slate-200"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setProfilePictureFile(e.target.files?.[0] || null)}
                />
              </div>
              <div className="flex justify-end gap-2">
                <button type="button" className="chip" onClick={cancelEditProfile} disabled={isSavingProfile}>
                  Cancel
                </button>
                <button type="submit" className="sidquillix-button disabled:opacity-60" disabled={isSavingProfile}>
                  {isSavingProfile ? 'Saving...' : 'Save changes'}
                </button>
              </div>
            </form>
          )}
        </div>

        <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />

        <div className="p-6">
          {isLoading ? (
            <div className="grid gap-4 md:grid-cols-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <ExpressionCardSkeleton key={i} />
              ))}
            </div>
          ) : items.length ? (
            <div className="grid gap-4 md:grid-cols-2">
              {items.map((expression) => (
                <div key={expression.id} className="space-y-2">
                  <ExpressionCard
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
                  {expression?.author?.handle === user.handle ? (
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        className="chip"
                        onClick={() => onEditPost(expression)}
                        disabled={editingId === expression.id}
                      >
                        {editingId === expression.id ? 'Updating...' : 'Edit'}
                      </button>
                      <button
                        type="button"
                        className="chip border-rose-400/30 text-rose-200"
                        onClick={() => onDeletePost(expression.id)}
                        disabled={deletingId === expression.id}
                      >
                        {deletingId === expression.id ? 'Deleting...' : 'Delete'}
                      </button>
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
              <div className="text-sm font-semibold text-slate-50">No posts yet</div>
              <div className="mt-1 text-sm text-slate-300/80">
                You haven’t posted anything yet. Create your first post and it will show here.
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

