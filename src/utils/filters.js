export function filterSites(sites, { companies, statuses, search }) {
  const q = search.trim().toLowerCase()
  return sites.filter((site) => {
    if (companies.size > 0 && !companies.has(site.company)) return false
    if (statuses.size > 0 && !statuses.has(site.status)) return false
    if (q) {
      const haystack = [site.company, site.project_name, site.city, site.region, site.country]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
      if (!haystack.includes(q)) return false
    }
    return true
  })
}
