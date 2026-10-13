import { useEffect, useRef } from 'react'
import {
  AttributionControl,
  Map as MapLibreMap,
  NavigationControl,
  setWorkerUrl,
} from 'maplibre-gl'
import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url'

setWorkerUrl(workerUrl)

const MAP_STYLES = {
  fiord: 'https://tiles.openfreemap.org/styles/fiord',
  liberty: 'https://tiles.openfreemap.org/styles/liberty',
  dark: 'https://tiles.openfreemap.org/styles/dark',
}

const SOURCE_ID = 'geoexplore-places'
const CLUSTER_LAYER_ID = 'geoexplore-place-clusters'
const CLUSTER_COUNT_LAYER_ID = 'geoexplore-place-cluster-count'
const HALO_LAYER_ID = 'geoexplore-place-halo'
const MARKER_LAYER_ID = 'geoexplore-place-markers'

function fitWorldMap(map, duration = 0) {
  const isCompact = window.innerWidth <= 620

  map.fitBounds(
    [[-174, -57], [178, 76]],
    {
      padding: isCompact
        ? { top: 94, right: 18, bottom: 36, left: 18 }
        : { top: 116, right: 44, bottom: 54, left: 44 },
      maxZoom: 1.45,
      duration,
      essential: false,
    },
  )
}

function toGeoJson(places) {
  return {
    type: 'FeatureCollection',
    features: places.map((place) => ({
      type: 'Feature',
      id: place.id,
      geometry: {
        type: 'Point',
        coordinates: [place.coordinates[1], place.coordinates[0]],
      },
      properties: {
        id: place.id,
        accent: place.accent,
        name: place.name,
      },
    })),
  }
}

function addPlaceLayers(map, places, selectedId) {
  const source = map.getSource(SOURCE_ID)

  if (source) {
    source.setData(toGeoJson(places))
    return
  }

  map.addSource(SOURCE_ID, {
    type: 'geojson',
    data: toGeoJson(places),
    cluster: true,
    clusterMaxZoom: 4,
    clusterRadius: 46,
  })

  map.addLayer({
    id: CLUSTER_LAYER_ID,
    type: 'circle',
    source: SOURCE_ID,
    filter: ['has', 'point_count'],
    paint: {
      'circle-radius': [
        'step',
        ['get', 'point_count'],
        17,
        5, 21,
        10, 25,
      ],
      'circle-color': [
        'step',
        ['get', 'point_count'],
        '#43836c',
        5, '#28664f',
        10, '#174b39',
      ],
      'circle-stroke-color': 'rgba(255, 255, 255, 0.96)',
      'circle-stroke-width': 2.5,
      'circle-opacity': 0.96,
    },
  })

  map.addLayer({
    id: CLUSTER_COUNT_LAYER_ID,
    type: 'symbol',
    source: SOURCE_ID,
    filter: ['has', 'point_count'],
    layout: {
      'text-field': ['get', 'point_count_abbreviated'],
      'text-size': 11,
      'text-font': ['Noto Sans Bold'],
      'text-allow-overlap': true,
    },
    paint: {
      'text-color': '#ffffff',
      'text-halo-color': 'rgba(15, 53, 40, 0.2)',
      'text-halo-width': 1,
    },
  })

  map.addLayer({
    id: HALO_LAYER_ID,
    type: 'circle',
    source: SOURCE_ID,
    filter: ['==', ['get', 'id'], selectedId ?? -1],
    paint: {
      'circle-radius': ['interpolate', ['linear'], ['zoom'], 1, 17, 7, 24],
      'circle-color': ['get', 'accent'],
      'circle-opacity': 0.2,
      'circle-blur': 0.25,
      'circle-stroke-color': ['get', 'accent'],
      'circle-stroke-opacity': 0.25,
      'circle-stroke-width': 2,
    },
  })

  map.addLayer({
    id: MARKER_LAYER_ID,
    type: 'circle',
    source: SOURCE_ID,
    filter: ['!', ['has', 'point_count']],
    paint: {
      'circle-radius': [
        'interpolate',
        ['linear'],
        ['zoom'],
        1,
        ['case', ['==', ['get', 'id'], selectedId ?? -1], 10, 8],
        7,
        ['case', ['==', ['get', 'id'], selectedId ?? -1], 14, 11],
      ],
      'circle-color': ['get', 'accent'],
      'circle-stroke-color': '#ffffff',
      'circle-stroke-width': 2.5,
      'circle-opacity': 0.98,
    },
  })
}

export default function WorldMap({ places, selectedPlace, onSelectPlace, mapTheme }) {
  const containerRef = useRef(null)
  const mapRef = useRef(null)
  const placesRef = useRef(places)
  const selectedPlaceRef = useRef(selectedPlace)
  const selectPlaceRef = useRef(onSelectPlace)
  const currentThemeRef = useRef(mapTheme)
  const userMovedMapRef = useRef(false)

  useEffect(() => {
    selectPlaceRef.current = onSelectPlace
  }, [onSelectPlace])

  useEffect(() => {
    selectedPlaceRef.current = selectedPlace
  }, [selectedPlace])

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    const map = new MapLibreMap({
      container: containerRef.current,
      style: MAP_STYLES[currentThemeRef.current],
      center: [8, 23],
      zoom: 0.7,
      minZoom: -0.4,
      maxZoom: 17,
      renderWorldCopies: false,
      antialias: true,
      attributionControl: false,
      dragRotate: false,
      pitchWithRotate: false,
      touchPitch: false,
      cooperativeGestures: false,
      fadeDuration: 180,
    })

    map.addControl(
      new NavigationControl({
        showCompass: false,
        showZoom: true,
      }),
      'bottom-right',
    )
    map.addControl(
      new AttributionControl({
        compact: true,
        customAttribution: '<a href="https://github.com/mledoze/countries" target="_blank">Country regions</a>',
      }),
      'bottom-right',
    )

    requestAnimationFrame(() => {
      const attribution = containerRef.current?.querySelector('.maplibregl-ctrl-attrib')
      attribution?.removeAttribute('open')
      attribution?.classList.remove('maplibregl-compact-show')
    })

    map.scrollZoom.setWheelZoomRate(1 / 650)
    map.scrollZoom.setZoomRate(1 / 90)

    map.on('dragstart', (event) => {
      if (event.originalEvent) userMovedMapRef.current = true
    })

    map.on('zoomstart', (event) => {
      if (event.originalEvent) userMovedMapRef.current = true
    })

    map.on('style.load', () => {
      map.setProjection({ type: 'mercator' })
      addPlaceLayers(map, placesRef.current, selectedPlaceRef.current?.id)
    })

    map.once('load', () => fitWorldMap(map))

    map.on('click', MARKER_LAYER_ID, (event) => {
      const placeId = Number(event.features?.[0]?.properties?.id)
      const place = placesRef.current.find((item) => item.id === placeId)
      if (place) selectPlaceRef.current(place)
    })

    map.on('click', CLUSTER_LAYER_ID, async (event) => {
      const clusterId = Number(event.features?.[0]?.properties?.cluster_id)
      const coordinates = event.features?.[0]?.geometry?.coordinates
      const source = map.getSource(SOURCE_ID)
      if (!source || !coordinates || Number.isNaN(clusterId)) return

      const zoom = await source.getClusterExpansionZoom(clusterId)
      map.easeTo({
        center: coordinates,
        zoom,
        duration: 650,
        easing: (time) => 1 - Math.pow(1 - time, 3),
      })
    })

    map.on('mouseenter', MARKER_LAYER_ID, () => {
      map.getCanvas().style.cursor = 'pointer'
    })

    map.on('mouseleave', MARKER_LAYER_ID, () => {
      map.getCanvas().style.cursor = ''
    })

    map.on('mouseenter', CLUSTER_LAYER_ID, () => {
      map.getCanvas().style.cursor = 'zoom-in'
    })

    map.on('mouseleave', CLUSTER_LAYER_ID, () => {
      map.getCanvas().style.cursor = ''
    })

    mapRef.current = map

    const resizeMap = () => {
      map.resize()

      if (!userMovedMapRef.current && !selectedPlaceRef.current) {
        fitWorldMap(map, 320)
      }
    }

    window.addEventListener('resize', resizeMap)

    return () => {
      window.removeEventListener('resize', resizeMap)
      map.remove()
      mapRef.current = null
    }
  }, [])

  useEffect(() => {
    placesRef.current = places
    const source = mapRef.current?.getSource(SOURCE_ID)
    source?.setData(toGeoJson(places))
  }, [places])

  useEffect(() => {
    const map = mapRef.current
    if (!map || currentThemeRef.current === mapTheme) return

    currentThemeRef.current = mapTheme
    map.setStyle(MAP_STYLES[mapTheme])
  }, [mapTheme])

  useEffect(() => {
    const map = mapRef.current
    const selectedId = selectedPlace?.id ?? -1

    if (map?.getLayer(HALO_LAYER_ID)) {
      map.setFilter(HALO_LAYER_ID, ['==', ['get', 'id'], selectedId])
      map.setPaintProperty(MARKER_LAYER_ID, 'circle-radius', [
        'interpolate',
        ['linear'],
        ['zoom'],
        1,
        ['case', ['==', ['get', 'id'], selectedId], 10, 8],
        7,
        ['case', ['==', ['get', 'id'], selectedId], 14, 11],
      ])
    }

    if (!selectedPlace || !map) return

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const desktopOffset = window.innerWidth > 820 ? [-100, 0] : [0, 70]

    map.easeTo({
      center: [selectedPlace.coordinates[1], selectedPlace.coordinates[0]],
      zoom: Math.max(map.getZoom(), 5.2),
      offset: desktopOffset,
      duration: reducedMotion ? 0 : 1150,
      easing: (time) => 1 - Math.pow(1 - time, 4),
      essential: false,
    })
  }, [selectedPlace])

  return (
    <>
      <div ref={containerRef} className="world-map" />
      <div className="map-marker-accessibility" aria-label="Map destinations">
        {places.map((place) => (
          <button key={place.id} onClick={() => onSelectPlace(place)}>
            {place.name}, {place.country}
          </button>
        ))}
      </div>
    </>
  )
}
