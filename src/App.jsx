import { useMemo, useState } from 'react'
import { useDatacenterData } from './hooks/useDatacenterData'
import { filterSites } from './utils/filters'
import FilterPanel from './components/FilterPanel'
import MapView from './components/MapView'
import TableView from './components/TableView'

export default function App() {
  const { sites, lastUpdated, status } = useDatacenterData()
  const [view, setView] = useState('map')
  const [companies, setCompanies] = useState(new Set())
  const [statuses, setStatuses] = useState(new Set())
  const [search, setSearch] = useState('')

  const allCompanies = useMemo(
    () => Array.from(new Set(sites.map((s) => s.company))).sort(),
    [sites],
  )

  const filtered = useMemo(
    () => filterSites(sites, { companies, statuses, search }),
    [sites, companies, statuses, search],
  )

  return (
    <div className="app">
      <header className="app-header">
        <h1>AI 데이터센터 글로벌 현황</h1>
        <div className="header-meta">
          <div className="view-toggle">
            <button className={view === 'map' ? 'active' : ''} onClick={() => setView('map')}>
              지도
            </button>
            <button className={view === 'table' ? 'active' : ''} onClick={() => setView('table')}>
              표
            </button>
          </div>
          <span className="last-updated">
            {status === 'loading' && '데이터 불러오는 중...'}
            {status === 'error' && '데이터 로드 실패'}
            {status === 'ready' && lastUpdated && `마지막 업데이트: ${lastUpdated.slice(0, 10)}`}
          </span>
        </div>
      </header>

      <div className="app-body">
        <FilterPanel
          allCompanies={allCompanies}
          companies={companies}
          setCompanies={setCompanies}
          statuses={statuses}
          setStatuses={setStatuses}
          search={search}
          setSearch={setSearch}
          resultCount={filtered.length}
        />
        <main className="app-main">
          {view === 'map' ? (
            <MapView
              sites={filtered}
              allCompanies={allCompanies}
              companies={companies}
              setCompanies={setCompanies}
            />
          ) : (
            <TableView sites={filtered} />
          )}
        </main>
      </div>
    </div>
  )
}
