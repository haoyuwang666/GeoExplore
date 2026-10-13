import { feature } from 'topojson-client'
import worldTopology from 'world-atlas/countries-110m.json'
import { countryRegionByNumericCode } from './countryRegions'

const regionPalettes = {
  AF: ['#ff6b4a', '#ff9f43', '#f85d9b', '#e76bf3'],
  AS: ['#5271ff', '#7559f2', '#00bcd4', '#14b8a6'],
  EU: ['#9b5cff', '#e956c9', '#6c63ff', '#4d7cff'],
  NA: ['#00c9a7', '#20b8cd', '#34c989', '#00a8e8'],
  SA: ['#ffb21c', '#ff7849', '#ffd166', '#f05d23'],
  OC: ['#00b8d9', '#36cfc9', '#008ed6', '#18b893'],
  AN: ['#b9eff7', '#9dd9f3'],
  OT: ['#8b9bb4', '#6f83a1'],
}

const countryFeatures = feature(
  worldTopology,
  worldTopology.objects.countries,
)

export const coloredCountries = {
  ...countryFeatures,
  features: countryFeatures.features.map((countryFeature) => {
    const numericCode = Number(countryFeature.id)
    const region = countryRegionByNumericCode[numericCode] ?? 'OT'
    const palette = regionPalettes[region] ?? regionPalettes.OT
    const shadeIndex = Number.isFinite(numericCode) ? numericCode % palette.length : 0

    return {
      ...countryFeature,
      properties: {
        ...countryFeature.properties,
        name: countryFeature.properties?.name ?? 'Unknown',
        region,
        fillColor: palette[shadeIndex],
      },
    }
  }),
}
