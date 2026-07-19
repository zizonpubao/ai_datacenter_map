import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const CACHE_PATH = path.join(__dirname, '..', '..', 'data', 'geocode_cache.json')

// Known AI-datacenter hub locations, pre-filled to avoid unnecessary geocoding calls.
const KNOWN_LOCATIONS = {
  'mount pleasant, wisconsin, united states': [42.71, -87.88],
  'phoenix, arizona, united states': [33.4484, -112.074],
  'san antonio, texas, united states': [29.4241, -98.4936],
  'abilene, texas, united states': [32.4487, -99.7331],
  'new albany, ohio, united states': [40.0806, -82.8088],
  'mesa, arizona, united states': [33.4152, -111.8315],
  'council bluffs, iowa, united states': [41.2619, -95.8608],
  'des moines, iowa, united states': [41.5868, -93.625],
  'reno, nevada, united states': [39.5296, -119.8138],
  'northern virginia, virginia, united states': [38.9586, -77.3570],
  'ashburn, virginia, united states': [39.0437, -77.4875],
  'atlanta, georgia, united states': [33.749, -84.388],
  'memphis, tennessee, united states': [35.1495, -90.049],
  'cheyenne, wyoming, united states': [41.14, -104.8202],
}

function loadCache() {
  try {
    return JSON.parse(fs.readFileSync(CACHE_PATH, 'utf-8'))
  } catch {
    return {}
  }
}

function saveCache(cache) {
  fs.mkdirSync(path.dirname(CACHE_PATH), { recursive: true })
  fs.writeFileSync(CACHE_PATH, JSON.stringify(cache, null, 2))
}

function keyFor(city, region, country) {
  return [city, region, country].filter(Boolean).join(', ').toLowerCase()
}

// Looks up coordinates for a city/region/country, in order: static table, local
// cache, then Nominatim (OpenStreetMap's free geocoder — rate limited to 1 req/sec
// per their usage policy, so callers should only invoke this for genuinely new
// locations).
export async function geocode(city, region, country) {
  const key = keyFor(city, region, country)
  if (KNOWN_LOCATIONS[key]) return KNOWN_LOCATIONS[key]

  const cache = loadCache()
  if (cache[key]) return cache[key]

  const query = [city, region, country].filter(Boolean).join(', ')
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`
  const res = await fetch(url, {
    headers: { 'User-Agent': 'ai-datacenter-map/1.0 (personal investment research project)' },
  })
  if (!res.ok) return null
  const results = await res.json()
  await new Promise((r) => setTimeout(r, 1100)) // respect Nominatim's 1 req/sec policy

  if (!results?.[0]) return null
  const coords = [parseFloat(results[0].lat), parseFloat(results[0].lon)]
  cache[key] = coords
  saveCache(cache)
  return coords
}
