import React, { useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { sendChatMessage, addUserMessage } from '../store/chatSlice'
import { fetchInteractions } from '../store/interactionsSlice'

export default function ChatInterface() {
  const dispatch = useDispatch()
  const { messages, sessionId, status, error } = useSelector((s) => s.chat)
  const [input, setInput] = useState('')
  const lastSentRef = useRef('')
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async (e) => {
    e.preventDefault()
    const text = input.trim()
    if (!text) return
    dispatch(addUserMessage(text))
    lastSentRef.current = text
    setInput('')
    await dispatch(sendChatMessage({ message: text, sessionId }))
    // Refresh the history panel in case the agent logged/edited something.
    dispatch(fetchInteractions())
  }

  const handleRetry = async () => {
    const text = lastSentRef.current
    if (!text) return
    dispatch(addUserMessage(text))
    await dispatch(sendChatMessage({ message: text, sessionId }))
    dispatch(fetchInteractions())
  }

  return (
    <div>
      <h2>Chat with the CRM Assistant</h2>
      <p className="subtitle">
        Describe your visit in plain language — the assistant logs it, edits past entries,
        looks up HCPs, and schedules follow-ups for you.
      </p>

      <div className="chat-window">
        <div className="chat-messages">
          {messages.map((m, i) => (
            <div key={i} className={`chat-bubble ${m.role === 'user' ? 'user' : 'agent'}`}>
              {m.content}
              {m.toolCalls && m.toolCalls.length > 0 && (
                <div>
                  {m.toolCalls.map((tc, j) => (
                    <span key={j} className="tool-tag">
                      {tc}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
          {status === 'loading' && (
            <div className="chat-bubble agent">
              <span className="spinner" /> Thinking…
            </div>
          )}
          {status === 'failed' && error && (
            <div className="chat-bubble agent error-bubble">
              {error}
              <div style={{ marginTop: 8 }}>
                <button className="btn btn-secondary" onClick={handleRetry}>
                  Retry
                </button>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        <form className="chat-input-row" onSubmit={handleSend}>
          <input
            placeholder='e.g. "Met Dr. Rao today, discussed Cardiozen, she wants a follow-up next Friday"'
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button className="btn btn-primary" type="submit" disabled={status === 'loading'}>
            Send
          </button>
        </form>
      </div>
    </div>
  )
}
