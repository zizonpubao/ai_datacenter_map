export const STATUS_META = {
  operating: { label: '운영중', color: '#2f9e44' },
  under_construction: { label: '건설중', color: '#f08c00' },
  announced: { label: '발표', color: '#868e96' },
}

export const STATUS_ORDER = ['operating', 'under_construction', 'announced']

export function formatUsd(value) {
  if (value === null || value === undefined || value === '') return '-'
  const n = Number(value)
  if (Number.isNaN(n)) return '-'
  if (n >= 1e9) return `$${(n / 1e9).toFixed(1)}B`
  if (n >= 1e6) return `$${(n / 1e6).toFixed(0)}M`
  return `$${n.toLocaleString()}`
}

export function formatMw(value) {
  if (value === null || value === undefined || value === '') return '-'
  const n = Number(value)
  if (Number.isNaN(n)) return '-'
  if (n >= 1000) return `${(n / 1000).toFixed(1)} GW`
  return `${n.toLocaleString()} MW`
}
