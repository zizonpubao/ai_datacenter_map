import { STATUS_META } from '../utils/constants'

export default function StatusBadge({ status, needsReview }) {
  const meta = STATUS_META[status] || { label: status, color: '#999' }
  return (
    <span className="status-badge" style={{ '--badge-color': meta.color }}>
      <span className="status-dot" />
      {meta.label}
      {needsReview && <span className="needs-review-flag" title="자동 추출, 검증 필요">?</span>}
    </span>
  )
}
