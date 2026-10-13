import {
  ArrowRight,
  Camera,
  CalendarDays,
  ExternalLink,
  Heart,
  MapPin,
  Star,
  X,
} from 'lucide-react'

export default function PlaceCard({ place, onClose, onExplore, liked, onToggleLike }) {
  return (
    <article className="place-card" aria-live="polite">
      <div
        className={place.hero ? 'place-card__visual place-card__visual--photo' : 'place-card__visual'}
        style={{
          '--place-accent': place.accent,
          '--place-image': place.hero ? `url("${place.hero}")` : 'none',
        }}
      >
        <div className="place-card__visual-grid" />
        <span className="place-card__flag" aria-hidden="true">
          {place.flag}
        </span>
        <div className="place-card__location">
          <MapPin size={15} aria-hidden="true" />
          {place.country} · {place.region}
        </div>
        <button className="icon-button icon-button--close" onClick={onClose} aria-label="Close place preview">
          <X size={19} />
        </button>
        <button
          className={liked ? 'icon-button icon-button--save icon-button--saved' : 'icon-button icon-button--save'}
          onClick={onToggleLike}
          aria-label={liked ? `Remove ${place.name} from saved places` : `Save ${place.name}`}
          aria-pressed={liked}
        >
          <Heart size={18} fill={liked ? 'currentColor' : 'none'} />
        </button>
        <div className="place-card__monogram" aria-hidden="true">
          {place.name.charAt(0)}
        </div>
        {place.hero && (
          <a
            className="place-card__photo-credit"
            href={place.sourceUrl}
            target="_blank"
            rel="noreferrer"
          >
            Wikipedia <ExternalLink size={10} />
          </a>
        )}
      </div>

      <div className="place-card__body">
        <p className="place-card__eyebrow">{place.eyebrow}</p>
        <h2>{place.name}</h2>

        <div className="place-card__stats" aria-label="Place information">
          <span>
            <Star size={15} fill="currentColor" aria-hidden="true" />
            <strong>{place.rating}</strong>
          </span>
          <span>
            <Camera size={15} aria-hidden="true" />
            {place.gallery.length} photos
          </span>
          <span>
            <CalendarDays size={15} aria-hidden="true" />
            {place.bestTime}
          </span>
        </div>

        <p className="place-card__description">{place.description}</p>

        <button className="primary-button" onClick={onExplore}>
          Explore this place
          <ArrowRight size={18} aria-hidden="true" />
        </button>
      </div>
    </article>
  )
}
