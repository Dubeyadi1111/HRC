import React from 'react'
import { useSelector } from 'react-redux'

function findHcpName(hcps, hcpId) {
  const hcp = hcps.find((h) => h.id === hcpId)
  return hcp ? hcp.name : `HCP #${hcpId}`
}

export default function HistoryPanel() {
  const interactions = useSelector((s) => s.interactions.items)
  const hcps = useSelector((s) => s.hcps.items)

  return (
    <div>
      <h2>Recent Interactions</h2>
      <p className="subtitle">Live view of everything logged via form or chat.</p>

      {interactions.length === 0 && (
        <div style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>
          No interactions logged yet.
        </div>
      )}

      {interactions.slice(0, 12).map((i) => (
        <div className="history-item" key={i.id}>
          <div className="hcp-name">
            {findHcpName(hcps, i.hcp_id)}
            <span className={`pill ${i.sentiment || 'neutral'}`}>{i.sentiment || 'neutral'}</span>
          </div>
          <div className="meta">
            {new Date(i.interaction_date).toLocaleDateString()} &middot; {i.interaction_type}
            {i.created_via === 'chat' ? ' · via chat' : ' · via form'}
          </div>
          <div className="summary">{i.summary || i.raw_notes}</div>
          {i.follow_up_required && (
            <div className="meta" style={{ marginTop: 4 }}>
              Follow-up: {i.follow_up_date ? new Date(i.follow_up_date).toLocaleDateString() : 'TBD'}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
