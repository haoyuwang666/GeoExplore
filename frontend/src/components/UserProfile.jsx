import { useEffect, useState } from 'react'
import { ArrowLeft, CalendarDays, Compass, Heart, Lightbulb, LogOut, Mail, MapPin, MessageCircle, MoveUpRight } from 'lucide-react'
import Pagination from './Pagination'

const PROFILE_COMMENTS_PER_PAGE = 5

function initials(name) {
  return name.split(/\s+/).map((part) => part[0]).join('').slice(0, 2).toUpperCase()
}

function memberDate(value) {
  if (!value) return 'New explorer'
  return `Joined ${new Intl.DateTimeFormat('en', { month: 'long', year: 'numeric' }).format(new Date(value))}`
}

function commentDate(value) {
  if (!value) return 'Just now'
  return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(value))
}

export default function UserProfile({ user, places, onBack, onExplorePlace, onUnlike, onLogout }) {
  const [commentPage, setCommentPage] = useState(1)
  const userTips = user.tips || []
  const likedPlaces = user.likedPlaceIds
    .map((id) => places.find((place) => place.id === id))
    .filter(Boolean)
  const totalCommentPages = Math.max(1, Math.ceil(user.comments.length / PROFILE_COMMENTS_PER_PAGE))
  const visibleComments = user.comments.slice(
    (commentPage - 1) * PROFILE_COMMENTS_PER_PAGE,
    commentPage * PROFILE_COMMENTS_PER_PAGE,
  )

  useEffect(() => {
    setCommentPage(1)
  }, [user.comments.length])

  return (
    <main className="profile-page">
      <nav className="profile-nav">
        <button type="button" onClick={onBack}><ArrowLeft size={18} /> Back to map</button>
        <div className="brand">
          <span className="brand__mark"><Compass size={20} /></span>
          <span className="brand__name">Geo<span>Explore</span></span>
        </div>
        <button className="profile-signout" type="button" onClick={onLogout}><LogOut size={17} /> Sign out</button>
      </nav>

      <header className="profile-hero">
        <div className="profile-avatar">{initials(user.displayName)}</div>
        <div>
          <p>Explorer profile</p>
          <h1>{user.displayName}</h1>
          <div className="profile-meta">
            <span><MapPin size={15} />{user.location || 'Somewhere curious'}</span>
            <span><Mail size={15} />{user.email}</span>
            <span><CalendarDays size={15} />{memberDate(user.memberSince)}</span>
          </div>
          <p className="profile-bio">{user.bio || 'Collecting places, memories, and good reasons to take the scenic route.'}</p>
        </div>
        <div className="profile-stats">
          <span><strong>{likedPlaces.length}</strong> saved places</span>
          <span><strong>{user.comments.length}</strong> shared notes</span>
          <span><strong>{userTips.length}</strong> practical tips</span>
        </div>
      </header>

      <div className="profile-content">
        <section className="profile-section" aria-labelledby="saved-heading">
          <div className="profile-section__heading">
            <div><p>My collection</p><h2 id="saved-heading">Places I love</h2></div>
            <span><Heart size={16} fill="currentColor" /> {likedPlaces.length} saved</span>
          </div>

          {likedPlaces.length ? (
            <div className="liked-grid">
              {likedPlaces.map((place) => (
                <article className="liked-place" key={place.id} style={{ '--place-accent': place.accent }}>
                  <button className="liked-place__image" type="button" onClick={() => onExplorePlace(place)} style={{ '--place-image': place.hero ? `url("${place.hero}")` : 'none' }} aria-label={`Explore ${place.name}`}>
                    <span>{place.flag}</span>
                  </button>
                  <div>
                    <p>{place.country} · {place.region}</p>
                    <h3>{place.name}</h3>
                    <div className="liked-place__actions">
                      <button type="button" onClick={() => onExplorePlace(place)}>Explore <MoveUpRight size={15} /></button>
                      <button type="button" onClick={() => onUnlike(place)} aria-label={`Remove ${place.name} from saved places`}><Heart size={16} fill="currentColor" /></button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="profile-empty"><Heart size={24} /><strong>No saved places yet</strong><p>Tap the heart on a destination to start your collection.</p><button type="button" onClick={onBack}>Explore the map</button></div>
          )}
        </section>

        <section className="profile-section profile-section--notes" aria-labelledby="notes-heading">
          <div className="profile-section__heading">
            <div><p>My contributions</p><h2 id="notes-heading">Traveler notes</h2></div>
            <span><MessageCircle size={16} /> {user.comments.length} shared</span>
          </div>

          {user.comments.length ? (
            <div className="profile-notes">
              {visibleComments.map((comment) => (
                <article key={comment.id}>
                  <div className="comment-avatar">{initials(user.displayName)}</div>
                  <div><header><strong>{comment.placeName}</strong><span>{commentDate(comment.createdAt)}</span></header><p>{comment.body}</p><button type="button" onClick={() => onExplorePlace(places.find((place) => place.id === comment.placeId))}>View place <MoveUpRight size={14} /></button></div>
                </article>
              ))}
              <Pagination page={commentPage} totalPages={totalCommentPages} onPageChange={setCommentPage} label="profile comments" />
            </div>
          ) : (
            <div className="profile-empty profile-empty--small"><MessageCircle size={24} /><strong>No comments yet</strong><p>Your comments will appear here after you share them on a place page.</p></div>
          )}
        </section>

        <section className="profile-section profile-section--notes" aria-labelledby="tips-profile-heading">
          <div className="profile-section__heading">
            <div><p>My contributions</p><h2 id="tips-profile-heading">Practical tips</h2></div>
            <span><Lightbulb size={16} /> {userTips.length} shared</span>
          </div>

          {userTips.length ? (
            <div className="profile-notes">
              {userTips.map((tip) => (
                <article key={tip.id}>
                  <div className="comment-avatar"><Lightbulb size={17} /></div>
                  <div>
                    <header><strong>{tip.placeName}</strong><span>{commentDate(tip.updatedAt || tip.createdAt)}</span></header>
                    <span className="tip-category">{tip.category.toLowerCase().replace('_', ' ')}</span>
                    <p>{tip.body}</p>
                    <button type="button" onClick={() => onExplorePlace(places.find((place) => place.id === tip.placeId))}>View place <MoveUpRight size={14} /></button>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="profile-empty profile-empty--small"><Lightbulb size={24} /><strong>No tips yet</strong><p>Your practical tips will appear here after you share them on a place page.</p></div>
          )}
        </section>
      </div>
    </main>
  )
}
