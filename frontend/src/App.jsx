import { useEffect, useMemo, useState } from 'react'
import {
  ChevronDown,
  CircleUserRound,
  Compass,
  Layers3,
  MapPin,
  Menu,
  Search,
  SlidersHorizontal,
  X,
} from 'lucide-react'
import AuthPage from './components/AuthPage'
import PlaceCard from './components/PlaceCard'
import PlaceDetails from './components/PlaceDetails'
import UserProfile from './components/UserProfile'
import WorldMap from './components/WorldMap'
import { getPlaces } from './api/places'
import { getCurrentUser, getApiMessage, logoutUser, setPlaceLiked } from './api/users'
import { regions } from './data/places'

const mapThemes = [
  { id: 'liberty', label: 'Vibrant', description: 'Bright terrain and clear detail', color: '#8fb3ee' },
  { id: 'fiord', label: 'Immersive', description: 'Deep water and vivid terrain', color: '#4f7894' },
  { id: 'dark', label: 'After dark', description: 'A cinematic night map', color: '#26363f' },
]

function readRoute() {
  const placeMatch = window.location.hash.match(/^#place\/(\d+)$/)
  if (placeMatch) return { page: 'place', placeId: placeMatch[1] }
  if (window.location.hash === '#profile') return { page: 'profile' }
  if (window.location.hash === '#auth/register') return { page: 'auth', mode: 'register' }
  if (window.location.hash === '#auth' || window.location.hash === '#auth/login') return { page: 'auth', mode: 'login' }
  return { page: 'map' }
}

export default function App() {
  const [places, setPlaces] = useState([])
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [reloadKey, setReloadKey] = useState(0)
  const [query, setQuery] = useState('')
  const [selectedRegion, setSelectedRegion] = useState('All')
  const [selectedPlace, setSelectedPlace] = useState(null)
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [themeOpen, setThemeOpen] = useState(false)
  const [mapTheme, setMapTheme] = useState('liberty')
  const [route, setRoute] = useState(readRoute)

  useEffect(() => {
    const syncRouteFromUrl = () => setRoute(readRoute())

    window.addEventListener('popstate', syncRouteFromUrl)
    window.addEventListener('hashchange', syncRouteFromUrl)
    return () => {
      window.removeEventListener('popstate', syncRouteFromUrl)
      window.removeEventListener('hashchange', syncRouteFromUrl)
    }
  }, [])

  useEffect(() => {
    getCurrentUser().then(setUser).catch(() => {})
  }, [])

  useEffect(() => {
    let active = true

    setIsLoading(true)
    setLoadError('')

    getPlaces()
      .then((loadedPlaces) => {
        if (active) setPlaces(loadedPlaces)
      })
      .catch(() => {
        if (active) setLoadError('We could not load destinations. Make sure the GeoExplore API is running.')
      })
      .finally(() => {
        if (active) setIsLoading(false)
      })

    return () => {
      active = false
    }
  }, [reloadKey])

  const filteredPlaces = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()

    return places.filter((place) => {
      const matchesRegion = selectedRegion === 'All' || place.region === selectedRegion
      const matchesQuery =
        !normalizedQuery ||
        place.name.toLowerCase().includes(normalizedQuery) ||
        place.country.toLowerCase().includes(normalizedQuery)

      return matchesRegion && matchesQuery
    })
  }, [places, query, selectedRegion])

  const selectPlace = (place) => {
    setSelectedPlace(place)
    setQuery('')
  }

  const clearFilters = () => {
    setQuery('')
    setSelectedRegion('All')
    setSelectedPlace(null)
  }

  const hasActiveFilters = selectedRegion !== 'All'
  const detailPlace = route.page === 'place'
    ? places.find((place) => String(place.id) === route.placeId)
    : null

  const navigate = (hash, state = {}) => {
    const url = hash ? `#${hash}` : `${window.location.pathname}${window.location.search}`
    window.history.pushState(state, '', url)
    setRoute(readRoute())
  }

  const explorePlace = (place) => {
    if (!place) return
    navigate(`place/${place.id}`, { geoExplorePlace: true })
  }

  const closePlaceDetails = () => {
    if (window.history.state?.geoExplorePlace) {
      window.history.back()
    } else {
      window.history.replaceState({}, '', `${window.location.pathname}${window.location.search}`)
      setRoute({ page: 'map' })
    }
  }

  const isLiked = (place) => Boolean(user?.likedPlaceIds.includes(place.id))

  const toggleLike = async (place) => {
    if (!user) {
      navigate('auth')
      return
    }

    try {
      const updatedUser = await setPlaceLiked(place.id, !isLiked(place))
      setUser(updatedUser)
    } catch (error) {
      if (error.response?.status === 401) {
        setUser(null)
        navigate('auth')
      } else {
        setLoadError(getApiMessage(error, 'We could not update your saved places.'))
      }
    }
  }

  const signOut = async () => {
    try {
      await logoutUser()
    } finally {
      setUser(null)
      navigate('')
    }
  }

  const syncCommunityProfile = ({ kind, action, item, id }) => {
    setUser((current) => {
      if (!current) return current
      const key = kind === 'comment' ? 'comments' : 'tips'
      const existing = current[key] || []
      const next = action === 'added'
        ? [item, ...existing]
        : action === 'updated'
          ? existing.map((entry) => entry.id === item.id ? item : entry)
          : existing.filter((entry) => entry.id !== id)
      return { ...current, [key]: next }
    })
  }

  if (route.page === 'auth' || (route.page === 'profile' && !user)) {
    return (
      <AuthPage
        initialMode={route.page === 'auth' ? route.mode : 'login'}
        onBack={() => navigate('')}
        onAuthenticated={(signedInUser) => {
          setUser(signedInUser)
          navigate('profile')
        }}
      />
    )
  }

  if (route.page === 'profile' && user) {
    return (
      <UserProfile
        user={user}
        places={places}
        onBack={() => navigate('')}
        onExplorePlace={explorePlace}
        onUnlike={toggleLike}
        onLogout={signOut}
      />
    )
  }

  if (detailPlace) {
    return (
      <PlaceDetails
        place={detailPlace}
        onBack={closePlaceDetails}
        user={user}
        liked={isLiked(detailPlace)}
        onToggleLike={() => toggleLike(detailPlace)}
        onRequireAuth={() => navigate('auth')}
        onCommunityChanged={syncCommunityProfile}
      />
    )
  }

  return (
    <main className="app-shell" data-map-theme={mapTheme}>
      <section className="map-stage" aria-label="Interactive map of featured destinations">
        <WorldMap
          places={filteredPlaces}
          selectedPlace={selectedPlace}
          onSelectPlace={setSelectedPlace}
          mapTheme={mapTheme}
        />
      </section>

      <header className="map-header">
        <a className="brand" href="#" aria-label="GeoExplore home" onClick={clearFilters}>
          <span className="brand__mark">
            <Compass size={21} strokeWidth={2.3} />
          </span>
          <span className="brand__name">Geo<span>Explore</span></span>
        </a>

        <div className="header-search">
          <Search size={19} aria-hidden="true" />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search places or countries"
            aria-label="Search places or countries"
          />
          {query && (
            <button className="header-search__clear" onClick={() => setQuery('')} aria-label="Clear search">
              <X size={16} />
            </button>
          )}

          {query && (
            <div className="search-results search-results--header">
              {filteredPlaces.length > 0 ? (
                filteredPlaces.slice(0, 5).map((place) => (
                  <button key={place.id} onClick={() => selectPlace(place)}>
                    <span className="search-results__flag">{place.flag}</span>
                    <span><strong>{place.name}</strong><small>{place.country}</small></span>
                    <MapPin size={15} aria-hidden="true" />
                  </button>
                ))
              ) : (
                <p>No places found. Try another destination.</p>
              )}
            </div>
          )}
        </div>

        <div className="header-actions">
          <span className="place-count">
            {isLoading ? 'Loading places…' : <><strong>{filteredPlaces.length}</strong> places</>}
          </span>
          <button
            className={user ? 'user-button user-button--signed-in' : 'user-button'}
            type="button"
            onClick={() => navigate(user ? 'profile' : 'auth')}
            aria-label={user ? `Open ${user.displayName}'s profile` : 'Sign in or create an account'}
            title={user ? user.displayName : 'Sign in'}
          >
            {user ? user.displayName.trim().charAt(0).toUpperCase() : <CircleUserRound size={19} />}
          </button>
          <button
            className={`header-action ${hasActiveFilters ? 'header-action--active' : ''}`}
            onClick={() => {
              setFiltersOpen((open) => !open)
              setThemeOpen(false)
              setMenuOpen(false)
            }}
            aria-expanded={filtersOpen}
            aria-label="Filter places by region"
          >
            <SlidersHorizontal size={17} />
            <span>Regions</span>
            <ChevronDown className={filtersOpen ? 'chevron chevron--open' : 'chevron'} size={15} />
          </button>
          <button
            className="header-action header-action--theme"
            onClick={() => {
              setThemeOpen((open) => !open)
              setFiltersOpen(false)
              setMenuOpen(false)
            }}
            aria-expanded={themeOpen}
            aria-label="Change map appearance"
          >
            <Layers3 size={17} />
            <span>Map style</span>
            <ChevronDown className={themeOpen ? 'chevron chevron--open' : 'chevron'} size={15} />
          </button>
          <button
            className="menu-button"
            onClick={() => {
              setMenuOpen((open) => !open)
              setFiltersOpen(false)
              setThemeOpen(false)
            }}
            aria-expanded={menuOpen}
            aria-label="Open navigation"
          >
            {menuOpen ? <X size={19} /> : <Menu size={19} />}
          </button>
        </div>

        {filtersOpen && (
          <div className="filter-drawer" aria-label="Filter by region">
            <div>
              <span className="filter-drawer__label">Explore by region</span>
              <button className="filter-drawer__clear" onClick={clearFilters}>Reset</button>
            </div>
            <div className="region-list">
              {regions.map((region) => (
                <button
                  key={region}
                  className={selectedRegion === region ? 'region-chip region-chip--active' : 'region-chip'}
                  onClick={() => {
                    setSelectedRegion(region)
                    setSelectedPlace(null)
                    setFiltersOpen(false)
                  }}
                >
                  {region}
                </button>
              ))}
            </div>
          </div>
        )}

        {themeOpen && (
          <div className="theme-drawer" aria-label="Choose map style">
            <span className="theme-drawer__label">Map atmosphere</span>
            <div className="theme-options">
              {mapThemes.map((theme) => (
                <button
                  key={theme.id}
                  className={mapTheme === theme.id ? 'theme-option theme-option--active' : 'theme-option'}
                  onClick={() => {
                    setMapTheme(theme.id)
                    setThemeOpen(false)
                  }}
                >
                  <span className="theme-option__swatch" style={{ '--theme-color': theme.color }} />
                  <span><strong>{theme.label}</strong><small>{theme.description}</small></span>
                </button>
              ))}
            </div>
          </div>
        )}

        {menuOpen && (
          <nav className="header-menu" aria-label="Main navigation">
            <a href="#explore">Explore map</a>
            <button className="header-menu__link" type="button" onClick={() => navigate(user ? 'profile' : 'auth')}>
              {user ? 'My profile' : 'Sign in'}
            </button>
            <a href="#about">About GeoExplore</a>
            {user ? <button type="button" onClick={signOut}>Sign out</button> : <button type="button" onClick={() => navigate('auth/register')}>Create account</button>}
          </nav>
        )}
      </header>

      <div className="map-intro">
        <span className="map-intro__eyebrow">Explore without a plan</span>
        <strong>The world is yours to discover.</strong>
      </div>

      {loadError && (
        <div className="api-error" role="alert">
          <span>{loadError}</span>
          <button onClick={() => setReloadKey((key) => key + 1)}>Try again</button>
        </div>
      )}

      {selectedPlace && (
        <div className="place-card-wrap">
          <PlaceCard
            place={selectedPlace}
            onClose={() => setSelectedPlace(null)}
            onExplore={() => explorePlace(selectedPlace)}
            liked={isLiked(selectedPlace)}
            onToggleLike={() => toggleLike(selectedPlace)}
          />
        </div>
      )}

      <div className="map-gesture-hint" aria-hidden="true">
        <span className="map-gesture-hint__dot" />
        Drag to move · Scroll or pinch to zoom
      </div>
    </main>
  )
}
