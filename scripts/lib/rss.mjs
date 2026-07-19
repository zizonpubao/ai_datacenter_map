// Minimal Google News RSS fetcher/parser (no external XML dependency needed —
// Google News RSS items are regular enough to extract with regex).
function decodeEntities(str) {
  return str
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&')
}

function extractTag(block, tag) {
  const match = block.match(new RegExp(`<${tag}>(?:<!\\[CDATA\\[)?([\\s\\S]*?)(?:\\]\\]>)?<\\/${tag}>`))
  return match ? decodeEntities(match[1].trim()) : ''
}

export async function fetchGoogleNewsRss(query) {
  const url = `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=en-US&gl=US&ceid=US:en`
  const res = await fetch(url, { headers: { 'User-Agent': 'ai-datacenter-map/1.0' } })
  if (!res.ok) throw new Error(`RSS fetch failed (${res.status}) for query: ${query}`)
  const xml = await res.text()
  const items = xml.match(/<item>[\s\S]*?<\/item>/g) || []
  return items.map((block) => ({
    title: extractTag(block, 'title'),
    link: extractTag(block, 'link'),
    pubDate: extractTag(block, 'pubDate'),
    source: extractTag(block, 'source'),
    description: extractTag(block, 'description').replace(/<[^>]+>/g, '').trim(),
  }))
}
