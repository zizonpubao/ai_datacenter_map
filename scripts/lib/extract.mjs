const MODEL = 'gemini-2.0-flash'
const ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`

const RESPONSE_SCHEMA = {
  type: 'object',
  properties: {
    is_relevant: {
      type: 'boolean',
      description:
        'true only if the article is specifically about a named/locatable AI or GPU data center construction, opening, or concrete announcement for the given company. false for generic news, earnings calls, unrelated products, or vague statements with no specific site.',
    },
    project_name: { type: 'string', nullable: true },
    country: { type: 'string', nullable: true },
    region: { type: 'string', nullable: true, description: 'State/province' },
    city: { type: 'string', nullable: true },
    status: { type: 'string', enum: ['operating', 'under_construction', 'announced'] },
    capacity_mw: { type: 'number', nullable: true },
    investment_usd: { type: 'number', nullable: true },
    announced_date: { type: 'string', nullable: true, description: 'YYYY-MM-DD if known' },
    expected_completion: { type: 'string', nullable: true, description: 'YYYY-MM or YYYY if known' },
  },
  required: ['is_relevant', 'status'],
}

// Calls Gemini's free-tier API to extract structured datacenter facts from a news
// headline/snippet. Returns null if not relevant or on any failure — callers should
// treat extraction failures as "skip", never as "fabricate a fallback".
export async function extractDatacenterFacts({ apiKey, company, title, description }) {
  const prompt = `You are extracting structured facts about AI/GPU data center construction from a news snippet, for a company named "${company}".

Only mark is_relevant true if this article describes a SPECIFIC, locatable data center site (has or implies a city/region) being built, opened, or concretely announced by "${company}" (or a subsidiary/partner project clearly tied to them, e.g. OpenAI's "Stargate" or xAI's "Colossus"). Do not extract generic AI news, financial results, product launches, or vague capex commentary with no specific site.

Never invent numbers or locations that are not stated or clearly implied in the text. Leave fields null if unknown.

Title: ${title}
Snippet: ${description}`

  const body = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
      responseMimeType: 'application/json',
      responseSchema: RESPONSE_SCHEMA,
      temperature: 0,
    },
  }

  try {
    const res = await fetch(`${ENDPOINT}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    if (!res.ok) {
      console.warn(`Gemini request failed (${res.status}) for "${title}"`)
      return null
    }
    const json = await res.json()
    const text = json.candidates?.[0]?.content?.parts?.[0]?.text
    if (!text) return null
    const parsed = JSON.parse(text)
    if (!parsed.is_relevant) return null
    return parsed
  } catch (err) {
    console.warn(`Gemini extraction error for "${title}":`, err.message)
    return null
  }
}
