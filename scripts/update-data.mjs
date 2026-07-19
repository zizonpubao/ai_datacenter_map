#!/usr/bin/env node
// Daily data-refresh script: pulls Google News RSS per tracked company, asks Gemini
// (free tier) to pull structured facts out of genuinely relevant articles, geocodes
// new locations, and merges everything into public/data/datacenters.json.
//
// Run with --dry-run to see what would change without writing any files.

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { COMPANIES } from './lib/companies.mjs'
import { fetchGoogleNewsRss } from './lib/rss.mjs'
import { extractDatacenterFacts } from './lib/extract.mjs'
import { geocode } from './lib/geocode.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DATA_PATH = path.join(__dirname, '..', 'public', 'data', 'datacenters.json')
const SEEN_URLS_PATH = path.join(__dirname, '..', 'data', 'seen_urls.json')

const DRY_RUN = process.argv.includes('--dry-run')
const MAX_NEW_ARTICLES_PER_COMPANY = 3
const API_KEY = process.env.GEMINI_API_KEY

function readJson(filePath, fallback) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'))
  } catch {
    return fallback
  }
}

function writeJson(filePath, data) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true })
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n')
}

function slugify(str) {
  return String(str)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

function findExistingSite(sites, { company, city, project_name }) {
  return sites.find(
    (s) =>
      s.company === company &&
      ((project_name && s.project_name && s.project_name.toLowerCase() === project_name.toLowerCase()) ||
        (city && s.city && s.city.toLowerCase() === city.toLowerCase())),
  )
}

async function main() {
  if (!API_KEY) {
    console.warn('GEMINI_API_KEY not set — skipping extraction (nothing to add this run).')
  }

  const dataFile = readJson(DATA_PATH, { last_updated: null, sites: [] })
  const seenUrls = new Set(readJson(SEEN_URLS_PATH, []))
  const today = new Date().toISOString().slice(0, 10)

  let addedCount = 0
  let updatedCount = 0

  for (const { name: company, queries } of COMPANIES) {
    if (!API_KEY) break

    const articles = []
    for (const query of queries) {
      try {
        articles.push(...(await fetchGoogleNewsRss(query)))
      } catch (err) {
        console.warn(`RSS fetch failed for "${query}":`, err.message)
      }
    }

    const unseen = articles.filter((a) => a.link && !seenUrls.has(a.link)).slice(0, MAX_NEW_ARTICLES_PER_COMPANY)

    for (const article of unseen) {
      seenUrls.add(article.link)

      const facts = await extractDatacenterFacts({
        apiKey: API_KEY,
        company,
        title: article.title,
        description: article.description,
      })
      if (!facts) continue

      let lat = null
      let lng = null
      if (facts.city || facts.region || facts.country) {
        const coords = await geocode(facts.city, facts.region, facts.country)
        if (coords) [lat, lng] = coords
      }

      const existing = findExistingSite(dataFile.sites, {
        company,
        city: facts.city,
        project_name: facts.project_name,
      })

      if (existing) {
        existing.status = facts.status ?? existing.status
        existing.capacity_mw = facts.capacity_mw ?? existing.capacity_mw
        existing.investment_usd = facts.investment_usd ?? existing.investment_usd
        existing.expected_completion = facts.expected_completion ?? existing.expected_completion
        existing.last_verified = today
        existing.source_url = article.link
        existing.source_name = article.source || existing.source_name
        updatedCount++
        console.log(`Updated: ${company} — ${existing.project_name || existing.city}`)
      } else {
        const id = slugify(`${company}-${facts.project_name || facts.city || 'site'}-${facts.region || facts.country || ''}`)
        dataFile.sites.push({
          id,
          company,
          project_name: facts.project_name || null,
          country: facts.country || null,
          region: facts.region || null,
          city: facts.city || null,
          lat,
          lng,
          status: facts.status,
          capacity_mw: facts.capacity_mw ?? null,
          investment_usd: facts.investment_usd ?? null,
          announced_date: facts.announced_date || null,
          expected_completion: facts.expected_completion || null,
          source_url: article.link,
          source_name: article.source || null,
          last_verified: today,
          confidence: 'medium',
          needs_review: true,
          notes: '',
        })
        addedCount++
        console.log(`Added: ${company} — ${facts.project_name || facts.city}`)
      }
    }
  }

  console.log(`\nDone. ${addedCount} added, ${updatedCount} updated.`)

  if (DRY_RUN) {
    console.log('(dry-run — no files written)')
    return
  }

  if (addedCount > 0 || updatedCount > 0) {
    dataFile.last_updated = new Date().toISOString()
  }
  writeJson(DATA_PATH, dataFile)
  writeJson(SEEN_URLS_PATH, Array.from(seenUrls))
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
