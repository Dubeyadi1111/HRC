import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchHcps, createHcp } from '../store/hcpSlice'
import { createInteraction, clearSubmitStatus } from '../store/interactionsSlice'

const INTERACTION_TYPES = [
  { value: 'in_person', label: 'In Person' },
  { value: 'virtual', label: 'Virtual' },
  { value: 'phone', label: 'Phone' },
  { value: 'email', label: 'Email' },
  { value: 'conference', label: 'Conference' },
]

const SENTIMENTS = ['positive', 'neutral', 'negative']

const emptyForm = {
  hcp_id: '',
  interaction_type: 'in_person',
  raw_notes: '',
  summary: '',
  topics_discussed: '',
  products_discussed: '',
  sentiment: 'neutral',
  samples_provided: '',
  follow_up_required: false,
  follow_up_date: '',
  follow_up_notes: '',
}

export default function StructuredForm() {
  const dispatch = useDispatch()
  const hcps = useSelector((s) => s.hcps.items)
  const lastSubmitStatus = useSelector((s) => s.interactions.lastSubmitStatus)

  const [form, setForm] = useState(emptyForm)
  const [newHcpName, setNewHcpName] = useState('')
  const [addingHcp, setAddingHcp] = useState(false)

  useEffect(() => {
    dispatch(fetchHcps())
  }, [dispatch])

  useEffect(() => {
    if (lastSubmitStatus === 'success') {
      setForm(emptyForm)
      const t = setTimeout(() => dispatch(clearSubmitStatus()), 3000)
      return () => clearTimeout(t)
    }
  }, [lastSubmitStatus, dispatch])

  const handleChange = (field) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setForm((f) => ({ ...f, [field]: value }))
  }

  const handleAddHcp = async () => {
    if (!newHcpName.trim()) return
    const result = await dispatch(createHcp({ name: newHcpName.trim() }))
    if (result.payload?.id) {
      setForm((f) => ({ ...f, hcp_id: result.payload.id }))
    }
    setNewHcpName('')
    setAddingHcp(false)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.hcp_id) return
    const payload = {
      ...form,
      hcp_id: Number(form.hcp_id),
      follow_up_date: form.follow_up_required && form.follow_up_date ? form.follow_up_date : null,
      created_via: 'form',
    }
    dispatch(createInteraction(payload))
  }

  return (
    <div>
      <h2>Log a New Interaction</h2>
      <p className="subtitle">Fill in the details of your visit or call with an HCP.</p>

      <form onSubmit={handleSubmit}>
        <div className="form-grid">
          <div className="form-field">
            <label>Healthcare Professional</label>
            {!addingHcp ? (
              <select value={form.hcp_id} onChange={handleChange('hcp_id')} required>
                <option value="">Select an HCP...</option>
                {hcps.map((h) => (
                  <option key={h.id} value={h.id}>
                    {h.name} {h.specialty ? `— ${h.specialty}` : ''}
                  </option>
                ))}
              </select>
            ) : (
              <div style={{ display: 'flex', gap: 6 }}>
                <input
                  placeholder="New HCP name"
                  value={newHcpName}
                  onChange={(e) => setNewHcpName(e.target.value)}
                />
                <button type="button" className="btn btn-secondary" onClick={handleAddHcp}>
                  Add
                </button>
              </div>
            )}
            <button
              type="button"
              onClick={() => setAddingHcp((v) => !v)}
              style={{
                border: 'none',
                background: 'none',
                color: 'var(--color-primary)',
                fontSize: 12,
                cursor: 'pointer',
                padding: 0,
                textAlign: 'left',
              }}
            >
              {addingHcp ? 'Choose existing instead' : '+ Add a new HCP'}
            </button>
          </div>

          <div className="form-field">
            <label>Interaction Type</label>
            <select value={form.interaction_type} onChange={handleChange('interaction_type')}>
              {INTERACTION_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          <div className="form-field full">
            <label>Notes</label>
            <textarea
              placeholder="What happened during the visit? (this can be summarized automatically)"
              value={form.raw_notes}
              onChange={handleChange('raw_notes')}
              required
            />
          </div>

          <div className="form-field">
            <label>Summary</label>
            <input
              placeholder="Optional — leave blank to auto-generate"
              value={form.summary}
              onChange={handleChange('summary')}
            />
          </div>

          <div className="form-field">
            <label>Products Discussed</label>
            <input
              placeholder="e.g. Cardiozen, Inhalix"
              value={form.products_discussed}
              onChange={handleChange('products_discussed')}
            />
          </div>

          <div className="form-field">
            <label>Samples Provided</label>
            <input
              placeholder="e.g. 2x Inhalix 50mg"
              value={form.samples_provided}
              onChange={handleChange('samples_provided')}
            />
          </div>

          <div className="form-field">
            <label>Sentiment</label>
            <select value={form.sentiment} onChange={handleChange('sentiment')}>
              {SENTIMENTS.map((s) => (
                <option key={s} value={s}>
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div className="form-field">
            <label>Topics Discussed</label>
            <input
              placeholder="Optional — leave blank to auto-extract"
              value={form.topics_discussed}
              onChange={handleChange('topics_discussed')}
            />
          </div>

          <div className="form-field full">
            <div className="checkbox-row">
              <input
                type="checkbox"
                checked={form.follow_up_required}
                onChange={handleChange('follow_up_required')}
                id="follow-up-check"
              />
              <label htmlFor="follow-up-check" style={{ textTransform: 'none' }}>
                Requires follow-up
              </label>
            </div>
          </div>

          {form.follow_up_required && (
            <>
              <div className="form-field">
                <label>Follow-up Date</label>
                <input
                  type="date"
                  value={form.follow_up_date}
                  onChange={handleChange('follow_up_date')}
                />
              </div>
              <div className="form-field">
                <label>Follow-up Notes</label>
                <input
                  placeholder="What to cover next time"
                  value={form.follow_up_notes}
                  onChange={handleChange('follow_up_notes')}
                />
              </div>
            </>
          )}
        </div>

        <button type="submit" className="btn btn-primary" disabled={!form.hcp_id}>
          Log Interaction
        </button>

        {lastSubmitStatus === 'success' && (
          <div className="status-msg success">Interaction logged successfully.</div>
        )}
        {lastSubmitStatus === 'error' && (
          <div className="status-msg error">Something went wrong. Please try again.</div>
        )}
      </form>
    </div>
  )
}
