import { useEffect, useState } from 'react'
import {
  ArrowLeft,
  CalendarDays,
  Camera,
  Check,
  ChevronRight,
  Clock3,
  Compass,
  ExternalLink,
  Heart,
  Lightbulb,
  MapPin,
  MessageCircle,
  Navigation,
  Pencil,
  Send,
  Star,
  Trash2,
  X,
} from 'lucide-react'
import {
  addPlaceComment,
  addPlaceTip,
  deleteComment,
  deleteTip,
  getApiMessage,
  getPlaceComments,
  getPlaceTips,
  updateComment,
  updateTip,
} from '../api/users'
import Pagination from './Pagination'

const COMMENTS_PER_PAGE = 4
const TIPS_PER_PAGE = 4
const TIP_CATEGORIES = [
  ['GENERAL', 'General'],
  ['PHOTOGRAPHY', 'Photography'],
  ['TRANSPORTATION', 'Transportation'],
  ['TIMING', 'Best timing'],
  ['SAFETY', 'Safety'],
]

function formatCoordinates(coordinates) {
  const [latitude, longitude] = coordinates
  const lat = `${Math.abs(latitude).toFixed(2)}° ${latitude >= 0 ? 'N' : 'S'}`
  const lng = `${Math.abs(longitude).toFixed(2)}° ${longitude >= 0 ? 'E' : 'W'}`
  return `${lat}, ${lng}`
}

function initials(name) {
  return name.split(/\s+/).map((part) => part[0]).join('').slice(0, 2).toUpperCase()
}

function relativeDate(value) {
  if (!value) return 'Just now'
  const days = Math.floor((Date.now() - new Date(value).getTime()) / 86400000)
  if (days <= 0) return 'Just now'
  if (days === 1) return 'Yesterday'
  if (days < 30) return `${days} days ago`
  return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric' }).format(new Date(value))
}

export default function PlaceDetails({
  place,
  onBack,
  user,
  liked,
  onToggleLike,
  onRequireAuth,
  onCommunityChanged,
}) {
  const [comments, setComments] = useState([])
  const [comment, setComment] = useState('')
  const [commentError, setCommentError] = useState('')
  const [commentsLoadError, setCommentsLoadError] = useState('')
  const [commentsLoading, setCommentsLoading] = useState(true)
  const [posting, setPosting] = useState(false)
  const [commentPage, setCommentPage] = useState(1)
  const [tips, setTips] = useState([])
  const [tip, setTip] = useState('')
  const [tipCategory, setTipCategory] = useState('GENERAL')
  const [tipsLoading, setTipsLoading] = useState(true)
  const [tipsLoadError, setTipsLoadError] = useState('')
  const [tipError, setTipError] = useState('')
  const [postingTip, setPostingTip] = useState(false)
  const [tipPage, setTipPage] = useState(1)
  const [editing, setEditing] = useState(null)
  const [savingEdit, setSavingEdit] = useState(false)
  const [deleting, setDeleting] = useState('')

  useEffect(() => {
    document.querySelector('.place-detail-page')?.scrollTo(0, 0)
  }, [place.id])

  useEffect(() => {
    let active = true
    setComments([])
    setCommentPage(1)
    setCommentsLoadError('')
    setCommentsLoading(true)
    getPlaceComments(place.id)
      .then((savedComments) => {
        if (active) setComments(savedComments)
      })
      .catch(() => {
        if (active) setCommentsLoadError('Comments could not be loaded. Please try again later.')
      })
      .finally(() => {
        if (active) setCommentsLoading(false)
      })
    return () => { active = false }
  }, [place.id])

  useEffect(() => {
    let active = true
    setTips([])
    setTipPage(1)
    setTipsLoadError('')
    setTipsLoading(true)
    getPlaceTips(place.id)
      .then((savedTips) => {
        if (active) setTips(savedTips)
      })
      .catch(() => {
        if (active) setTipsLoadError('Tips could not be loaded. Please try again later.')
      })
      .finally(() => {
        if (active) setTipsLoading(false)
      })
    return () => { active = false }
  }, [place.id])

  const totalCommentPages = Math.max(1, Math.ceil(comments.length / COMMENTS_PER_PAGE))
  const visibleComments = comments.slice(
    (commentPage - 1) * COMMENTS_PER_PAGE,
    commentPage * COMMENTS_PER_PAGE,
  )
  const totalTipPages = Math.max(1, Math.ceil(tips.length / TIPS_PER_PAGE))
  const visibleTips = tips.slice(
    (tipPage - 1) * TIPS_PER_PAGE,
    tipPage * TIPS_PER_PAGE,
  )

  const submitComment = async (event) => {
    event.preventDefault()
    const text = comment.trim()
    if (!text) return

    if (!user) {
      onRequireAuth()
      return
    }

    setPosting(true)
    setCommentError('')
    try {
      const savedComment = await addPlaceComment(place.id, text)
      setComments((current) => [savedComment, ...current])
      setCommentPage(1)
      setComment('')
      onCommunityChanged({ kind: 'comment', action: 'added', item: savedComment })
    } catch (error) {
      setCommentError(getApiMessage(error, 'Your note could not be posted.'))
    } finally {
      setPosting(false)
    }
  }

  const submitTip = async (event) => {
    event.preventDefault()
    const text = tip.trim()
    if (!text) return
    if (!user) {
      onRequireAuth()
      return
    }

    setPostingTip(true)
    setTipError('')
    try {
      const savedTip = await addPlaceTip(place.id, tipCategory, text)
      setTips((current) => [savedTip, ...current])
      setTipPage(1)
      setTip('')
      setTipCategory('GENERAL')
      onCommunityChanged({ kind: 'tip', action: 'added', item: savedTip })
    } catch (error) {
      setTipError(getApiMessage(error, 'Your tip could not be posted.'))
    } finally {
      setPostingTip(false)
    }
  }

  const startEditing = (kind, item) => {
    setEditing({ kind, id: item.id, body: item.body, category: item.category || 'GENERAL' })
  }

  const saveEdit = async (event) => {
    event.preventDefault()
    const body = editing.body.trim()
    if (!body) return

    setSavingEdit(true)
    try {
      const saved = editing.kind === 'comment'
        ? await updateComment(editing.id, body)
        : await updateTip(editing.id, editing.category, body)
      const setter = editing.kind === 'comment' ? setComments : setTips
      setter((current) => current.map((item) => item.id === saved.id ? saved : item))
      onCommunityChanged({ kind: editing.kind, action: 'updated', item: saved })
      setEditing(null)
    } catch (error) {
      const message = getApiMessage(error, 'Your changes could not be saved.')
      if (editing.kind === 'comment') setCommentError(message)
      else setTipError(message)
    } finally {
      setSavingEdit(false)
    }
  }

  const removeCommunityItem = async (kind, id) => {
    if (!window.confirm(`Delete this ${kind}? This cannot be undone.`)) return
    setDeleting(`${kind}-${id}`)
    try {
      if (kind === 'comment') {
        await deleteComment(id)
        setComments((current) => current.filter((item) => item.id !== id))
      } else {
        await deleteTip(id)
        setTips((current) => current.filter((item) => item.id !== id))
      }
      onCommunityChanged({ kind, action: 'deleted', id })
    } catch (error) {
      const message = getApiMessage(error, `The ${kind} could not be deleted.`)
      if (kind === 'comment') setCommentError(message)
      else setTipError(message)
    } finally {
      setDeleting('')
    }
  }

  return (
    <main className="place-detail-page">
      <nav className="detail-nav" aria-label="Place detail navigation">
        <button className="detail-nav__back" type="button" onClick={onBack}>
          <ArrowLeft size={18} />
          <span>Back to map</span>
        </button>
        <a className="brand detail-nav__brand" href="#" onClick={(event) => { event.preventDefault(); onBack() }}>
          <span className="brand__mark"><Compass size={20} strokeWidth={2.3} /></span>
          <span className="brand__name">Geo<span>Explore</span></span>
        </a>
        <button
          className={liked ? 'detail-save detail-save--active' : 'detail-save'}
          type="button"
          onClick={onToggleLike}
          aria-pressed={liked}
        >
          {liked ? <Check size={17} /> : <Heart size={17} />}
          <span>{liked ? 'Saved' : 'Save place'}</span>
        </button>
      </nav>

      <header
        className="detail-hero"
        style={{
          '--hero-image': place.hero ? `url("${place.hero}")` : 'none',
          '--place-accent': place.accent,
        }}
      >
        <div className="detail-hero__content">
          <div className="detail-breadcrumb">
            <span>{place.region}</span>
            <ChevronRight size={14} />
            <span>{place.country}</span>
          </div>
          <div className="detail-hero__flag" aria-hidden="true">{place.flag}</div>
          <p>{place.eyebrow}</p>
          <h1>{place.name}</h1>
          <div className="detail-hero__meta">
            <span><MapPin size={16} />{place.country}</span>
            <span><Star size={16} fill="currentColor" />{place.rating} rating</span>
            <span><MessageCircle size={16} />{comments.length} traveler comments</span>
            {place.hero && (
              <a href={place.sourceUrl} target="_blank" rel="noreferrer">
                <ExternalLink size={15} /> Photo source
              </a>
            )}
          </div>
        </div>
        <div className="detail-hero__scroll" aria-hidden="true">
          <span /> Scroll to discover
        </div>
      </header>

      <div className="detail-content">
        <section className="detail-overview" aria-labelledby="overview-heading">
          <div className="detail-section-copy">
            <p className="detail-kicker">Start exploring</p>
            <h2 id="overview-heading">A place worth slowing down for.</h2>
            <p className="detail-lead">{place.description}</p>
            <p>
              Take in the landmark from more than one angle, make room for the smaller discoveries nearby,
              and let the character of {place.country} set the pace for your visit.
            </p>
          </div>

          <aside className="quick-facts" aria-label="Quick facts">
            <h3>Good to know</h3>
            <div className="quick-facts__grid">
              <div><CalendarDays size={20} /><span><small>Best time</small><strong>{place.bestTime}</strong></span></div>
              <div><Clock3 size={20} /><span><small>Plan for</small><strong>{place.visitLength}</strong></span></div>
              <div><Navigation size={20} /><span><small>Coordinates</small><strong>{formatCoordinates(place.coordinates)}</strong></span></div>
              <div><Compass size={20} /><span><small>Region</small><strong>{place.region}</strong></span></div>
            </div>
          </aside>
        </section>

        <section className="detail-gallery" aria-labelledby="gallery-heading">
          <div className="detail-section-heading">
            <div>
              <p className="detail-kicker">In pictures</p>
              <h2 id="gallery-heading">A glimpse of the journey</h2>
            </div>
            <span><Camera size={16} /> {place.gallery.length} photos</span>
          </div>
          <div className={place.gallery.length ? 'photo-grid' : 'photo-grid photo-grid--loading'}>
            {(place.gallery.length ? place.gallery : Array.from({ length: 5 })).map((photo, index) => (
              <figure key={photo?.src || `placeholder-${index}`} className={`photo-grid__item photo-grid__item--${index + 1}`}>
                {photo && <img src={photo.src} alt={photo.alt} loading={index > 1 ? 'lazy' : 'eager'} />}
              </figure>
            ))}
          </div>
        </section>

        <section className="community-section" aria-labelledby="comments-heading">
          <div className="community-intro">
            <p className="detail-kicker">From the community</p>
            <h2 id="comments-heading">Traveler notes</h2>
            <p>Fresh impressions and stories from people who have been there.</p>
            <div className="community-score">
              <strong>{place.rating}</strong>
              <span><span aria-label={`${place.rating} out of 5 stars`}>★ ★ ★ ★ ★</span>{comments.length} shared comments</span>
            </div>
          </div>

          <div className="comments-panel">
            <form className="comment-form" onSubmit={submitComment}>
              <div className="comment-avatar comment-avatar--you">{user ? initials(user.displayName) : '?'}</div>
              <label>
                <span className="visually-hidden">Share a traveler note</span>
                <textarea
                  value={comment}
                  onChange={(event) => setComment(event.target.value)}
                  onFocus={() => { if (!user) onRequireAuth() }}
                  placeholder={user ? `Share a note about ${place.name}…` : 'Sign in to share a traveler note…'}
                  rows="3"
                  maxLength="500"
                />
              </label>
              <button type="submit" disabled={!comment.trim() || posting} aria-label="Post your traveler note">
                <Send size={16} /> {posting ? 'Posting…' : 'Post'}
              </button>
            </form>
            {commentError && <p className="comment-error" role="alert">{commentError}</p>}

            {commentsLoading ? (
              <div className="comment-empty">Loading traveler comments…</div>
            ) : commentsLoadError ? (
              <div className="comment-empty comment-empty--error">{commentsLoadError}</div>
            ) : comments.length ? (
              <>
                <div className="comments-list">
                  {visibleComments.map((item) => (
                    <article className="comment" key={item.id}>
                      <div className="comment-avatar">{initials(item.authorName)}</div>
                      <div>
                        <header>
                          <strong>{item.authorName}</strong>
                          <span>{relativeDate(item.updatedAt || item.createdAt)}{item.updatedAt !== item.createdAt ? ' · edited' : ''}</span>
                        </header>
                        {editing?.kind === 'comment' && editing.id === item.id ? (
                          <form className="community-edit" onSubmit={saveEdit}>
                            <textarea value={editing.body} onChange={(event) => setEditing((current) => ({ ...current, body: event.target.value }))} rows="3" maxLength="500" autoFocus />
                            <div>
                              <button type="button" onClick={() => setEditing(null)}><X size={14} /> Cancel</button>
                              <button type="submit" disabled={!editing.body.trim() || savingEdit}><Check size={14} /> {savingEdit ? 'Saving…' : 'Save'}</button>
                            </div>
                          </form>
                        ) : (
                          <p>{item.body}</p>
                        )}
                        {user?.id === item.authorId && !(editing?.kind === 'comment' && editing.id === item.id) && (
                          <div className="community-actions">
                            <button type="button" onClick={() => startEditing('comment', item)}><Pencil size={13} /> Edit</button>
                            <button type="button" onClick={() => removeCommunityItem('comment', item.id)} disabled={deleting === `comment-${item.id}`}><Trash2 size={13} /> {deleting === `comment-${item.id}` ? 'Deleting…' : 'Delete'}</button>
                          </div>
                        )}
                      </div>
                    </article>
                  ))}
                </div>
                <Pagination page={commentPage} totalPages={totalCommentPages} onPageChange={setCommentPage} label="place comments" />
              </>
            ) : (
              <div className="comment-empty">
                <MessageCircle size={22} />
                <strong>No comments yet</strong>
                <span>Be the first traveler to share a note about {place.name}.</span>
              </div>
            )}
          </div>
        </section>

        <section className="community-section community-section--tips" aria-labelledby="tips-heading">
          <div className="community-intro">
            <p className="detail-kicker">Plan with confidence</p>
            <h2 id="tips-heading">Practical tips</h2>
            <p>Useful advice for timing, transportation, safety, and photography.</p>
            <div className="community-score community-score--tips">
              <strong><Lightbulb size={27} /></strong>
              <span><b>{tips.length}</b> community tips</span>
            </div>
          </div>

          <div className="comments-panel">
            <form className="comment-form tip-form" onSubmit={submitTip}>
              <div className="comment-avatar comment-avatar--tip"><Lightbulb size={18} /></div>
              <label>
                <span className="visually-hidden">Tip category</span>
                <select value={tipCategory} onChange={(event) => setTipCategory(event.target.value)} aria-label="Tip category">
                  {TIP_CATEGORIES.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                </select>
                <textarea
                  value={tip}
                  onChange={(event) => setTip(event.target.value)}
                  onFocus={() => { if (!user) onRequireAuth() }}
                  placeholder={user ? `Share something useful about ${place.name}…` : 'Sign in to share a practical tip…'}
                  rows="3"
                  maxLength="500"
                />
              </label>
              <button type="submit" disabled={!tip.trim() || postingTip}>
                <Send size={16} /> {postingTip ? 'Posting…' : 'Post tip'}
              </button>
            </form>
            {tipError && <p className="comment-error" role="alert">{tipError}</p>}

            {tipsLoading ? (
              <div className="comment-empty">Loading practical tips…</div>
            ) : tipsLoadError ? (
              <div className="comment-empty comment-empty--error">{tipsLoadError}</div>
            ) : tips.length ? (
              <>
                <div className="comments-list tips-list">
                  {visibleTips.map((item) => (
                    <article className="comment tip" key={item.id}>
                      <div className="comment-avatar">{initials(item.authorName)}</div>
                      <div>
                        <header>
                          <strong>{item.authorName}</strong>
                          <span>{relativeDate(item.updatedAt || item.createdAt)}{item.updatedAt !== item.createdAt ? ' · edited' : ''}</span>
                        </header>
                        {editing?.kind === 'tip' && editing.id === item.id ? (
                          <form className="community-edit" onSubmit={saveEdit}>
                            <select value={editing.category} onChange={(event) => setEditing((current) => ({ ...current, category: event.target.value }))}>
                              {TIP_CATEGORIES.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                            </select>
                            <textarea value={editing.body} onChange={(event) => setEditing((current) => ({ ...current, body: event.target.value }))} rows="3" maxLength="500" autoFocus />
                            <div>
                              <button type="button" onClick={() => setEditing(null)}><X size={14} /> Cancel</button>
                              <button type="submit" disabled={!editing.body.trim() || savingEdit}><Check size={14} /> {savingEdit ? 'Saving…' : 'Save'}</button>
                            </div>
                          </form>
                        ) : (
                          <><span className="tip-category">{TIP_CATEGORIES.find(([value]) => value === item.category)?.[1] || 'General'}</span><p>{item.body}</p></>
                        )}
                        {user?.id === item.authorId && !(editing?.kind === 'tip' && editing.id === item.id) && (
                          <div className="community-actions">
                            <button type="button" onClick={() => startEditing('tip', item)}><Pencil size={13} /> Edit</button>
                            <button type="button" onClick={() => removeCommunityItem('tip', item.id)} disabled={deleting === `tip-${item.id}`}><Trash2 size={13} /> {deleting === `tip-${item.id}` ? 'Deleting…' : 'Delete'}</button>
                          </div>
                        )}
                      </div>
                    </article>
                  ))}
                </div>
                <Pagination page={tipPage} totalPages={totalTipPages} onPageChange={setTipPage} label="place tips" />
              </>
            ) : (
              <div className="comment-empty">
                <Lightbulb size={22} />
                <strong>No tips yet</strong>
                <span>Be the first traveler to share practical advice about {place.name}.</span>
              </div>
            )}
          </div>
        </section>
      </div>

      <footer className="detail-footer">
        <div className="brand">
          <span className="brand__mark"><Compass size={20} /></span>
          <span className="brand__name">Geo<span>Explore</span></span>
        </div>
        <p>Keep following your curiosity.</p>
        <button type="button" onClick={onBack}>Return to the map <ArrowLeft size={16} /></button>
      </footer>
    </main>
  )
}
