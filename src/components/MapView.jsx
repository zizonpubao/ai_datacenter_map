import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import MarkerClusterGroup from 'react-leaflet-cluster'
import L from 'leaflet'
import { STATUS_META, formatUsd, formatMw } from '../utils/constants'
import StatusBadge from './StatusBadge'

function makeIcon(status) {
  const color = STATUS_META[status]?.color || '#999'
  return L.divIcon({
    className: 'site-marker',
    html: `<span style="background:${color}"></span>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
    popupAnchor: [0, -8],
  })
}

const ICONS = {
  operating: makeIcon('operating'),
  under_construction: makeIcon('under_construction'),
  announced: makeIcon('announced'),
}

export default function MapView({ sites }) {
  const withCoords = sites.filter((s) => typeof s.lat === 'number' && typeof s.lng === 'number')

  return (
    <MapContainer center={[30, -20]} zoom={2} minZoom={2} className="map-container">
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MarkerClusterGroup chunkedLoading>
        {withCoords.map((site) => (
          <Marker key={site.id} position={[site.lat, site.lng]} icon={ICONS[site.status] || ICONS.announced}>
            <Popup>
              <div className="popup-content">
                <div className="popup-title">
                  {site.company} — {site.project_name || site.city}
                </div>
                <div className="popup-location">
                  {[site.city, site.region, site.country].filter(Boolean).join(', ')}
                </div>
                <StatusBadge status={site.status} needsReview={site.needs_review} />
                <table className="popup-table">
                  <tbody>
                    <tr>
                      <td>용량</td>
                      <td>{formatMw(site.capacity_mw)}</td>
                    </tr>
                    <tr>
                      <td>투자금액</td>
                      <td>{formatUsd(site.investment_usd)}</td>
                    </tr>
                    <tr>
                      <td>발표일</td>
                      <td>{site.announced_date || '-'}</td>
                    </tr>
                    <tr>
                      <td>완공예정</td>
                      <td>{site.expected_completion || '-'}</td>
                    </tr>
                  </tbody>
                </table>
                {site.source_url && (
                  <a href={site.source_url} target="_blank" rel="noreferrer">
                    출처: {site.source_name || '기사 원문'}
                  </a>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MarkerClusterGroup>
    </MapContainer>
  )
}
