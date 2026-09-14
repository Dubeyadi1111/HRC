import React, { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { fetchHcps } from './store/hcpSlice'
import { fetchInteractions } from './store/interactionsSlice'
import StructuredForm from './components/StructuredForm'
import ChatInterface from './components/ChatInterface'
import HistoryPanel from './components/HistoryPanel'

export default function App() {
  const dispatch = useDispatch()
  const [activeTab, setActiveTab] = useState('form') // 'form' | 'chat'

  useEffect(() => {
    dispatch(fetchHcps())
    dispatch(fetchInteractions())
  }, [dispatch])

  return (
    <div className="app-shell">
      <div className="app-header">
        <div className="brand">
          <div className="brand-badge">Rx</div>
          <h1>HCP Interaction Log</h1>
        </div>
        <div className="subtitle" style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>
          AI-first CRM &middot; Field Rep Console
        </div>
      </div>

      <div className="tabs">
        <button
          className={`tab-btn ${activeTab === 'form' ? 'active' : ''}`}
          onClick={() => setActiveTab('form')}
        >
          Structured Form
        </button>
        <button
          className={`tab-btn ${activeTab === 'chat' ? 'active' : ''}`}
          onClick={() => setActiveTab('chat')}
        >
          Chat Assistant
        </button>
      </div>

      <div className="layout-grid">
        <div className="card panel">
          {activeTab === 'form' ? <StructuredForm /> : <ChatInterface />}
        </div>
        <div className="card panel">
          <HistoryPanel />
        </div>
      </div>
    </div>
  )
}
