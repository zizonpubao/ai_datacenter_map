import { STATUS_META, STATUS_ORDER, formatUsd, formatMw } from '../utils/constants'

export default function FilterPanel({
  allCompanies,
  companies,
  setCompanies,
  statuses,
  setStatuses,
  search,
  setSearch,
  resultCount,
  statusTotals,
  totalCapacityMw,
}) {
  function toggleCompany(company) {
    const next = new Set(companies)
    if (next.has(company)) next.delete(company)
    else next.add(company)
    setCompanies(next)
  }

  function toggleStatus(statusKey) {
    const next = new Set(statuses)
    if (next.has(statusKey)) next.delete(statusKey)
    else next.add(statusKey)
    setStatuses(next)
  }

  return (
    <aside className="filter-panel">
      <input
        type="text"
        className="search-input"
        placeholder="기업, 도시, 프로젝트 검색..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div className="filter-group">
        <h3>상태</h3>
        {STATUS_ORDER.map((key) => (
          <label key={key} className="filter-checkbox">
            <input
              type="checkbox"
              checked={statuses.has(key)}
              onChange={() => toggleStatus(key)}
            />
            <span className="status-dot" style={{ '--badge-color': STATUS_META[key].color }} />
            <span className="filter-checkbox-label">{STATUS_META[key].label}</span>
            {(key === 'under_construction' || key === 'announced') && (
              <span className="filter-checkbox-total">{formatUsd(statusTotals?.[key])}</span>
            )}
          </label>
        ))}
        {statuses.size > 0 && (
          <button className="clear-btn" onClick={() => setStatuses(new Set())}>
            전체 해제
          </button>
        )}
        <div className="total-capacity">전체 전력량: {formatMw(totalCapacityMw)}</div>
      </div>

      <div className="filter-group">
        <h3>기업</h3>
        <div className="company-list">
          {allCompanies.map((company) => (
            <label key={company} className="filter-checkbox">
              <input
                type="checkbox"
                checked={companies.has(company)}
                onChange={() => toggleCompany(company)}
              />
              {company}
            </label>
          ))}
        </div>
        {companies.size > 0 && (
          <button className="clear-btn" onClick={() => setCompanies(new Set())}>
            전체 해제
          </button>
        )}
      </div>

      <div className="result-count">{resultCount}건 표시 중</div>
    </aside>
  )
}
