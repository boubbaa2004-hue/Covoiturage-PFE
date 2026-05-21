import { useState, useEffect, useRef } from 'react'
import { getToken, getUser } from '../../lib/api'

const API = 'http://localhost:8080/api'

export default function Chat({ type, refId, destinataireId, nomDestinataire, onClose }) {
  const user = getUser()
  const [messages, setMessages] = useState([])
  const [contenu, setContenu] = useState('')
  const [loading, setLoading] = useState(true)
  const [envoi, setEnvoi] = useState(false)
  const bottomRef = useRef(null)
  const intervalRef = useRef(null)

  const authHeader = () => ({ 'Authorization': `Bearer ${getToken()}` })

  const chargerMessages = async () => {
    try {
      const res = await fetch(`${API}/messages/conversation/${type}/${refId}`, {
        headers: authHeader()
      })
      if (res.ok) {
        const data = await res.json()
        setMessages(Array.isArray(data) ? data : [])
      }
    } catch (e) {}
    finally { setLoading(false) }
  }

  useEffect(() => {
    chargerMessages()
    // Poll toutes les 5s
    intervalRef.current = setInterval(chargerMessages, 5000)
    return () => clearInterval(intervalRef.current)
  }, [type, refId])

  //  Auto-scroll vers le bas
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleEnvoyer = async () => {
    if (!contenu.trim() || envoi) return
    setEnvoi(true)
    try {
      const res = await fetch(`${API}/messages`, {
        method: 'POST',
        headers: { ...authHeader(), 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contenu: contenu.trim(),
          typeConversation: type,
          referenceId: refId,
          destinataireId
        })
      })
      if (res.ok) {
        setContenu('')
        chargerMessages()
      }
    } catch (e) {}
    finally { setEnvoi(false) }
  }

  const formatTime = (date) =>
    new Date(date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })

  const formatDate = (date) => {
    const d = new Date(date)
    const today = new Date()
    if (d.toDateString() === today.toDateString()) return "Aujourd'hui"
    return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })
  }

  // Grouper les messages par date
  const messagesByDate = messages.reduce((acc, m) => {
    const date = formatDate(m.dateEnvoi)
    if (!acc[date]) acc[date] = []
    acc[date].push(m)
    return acc
  }, {})

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)',
      zIndex: 3000, display: 'flex', alignItems: 'center',
      justifyContent: 'center', padding: '1rem'
    }}>
      <div style={{
        background: 'white', borderRadius: 16, width: '100%',
        maxWidth: 480, height: '80vh', display: 'flex',
        flexDirection: 'column', boxShadow: '0 24px 64px rgba(0,0,0,0.25)',
        overflow: 'hidden'
      }}>

        {/* Header */}
        <div style={{
          background: '#111827', padding: '1rem 1.5rem',
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
            <div style={{
              width: 40, height: 40, borderRadius: '50%',
              background: '#00875A', display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontWeight: 700, fontSize: '0.9rem',
              color: 'white', fontFamily: 'system-ui,sans-serif', flexShrink: 0
            }}>
              {nomDestinataire?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '??'}
            </div>
            <div>
              <div style={{ fontWeight: 600, color: 'white', fontSize: '0.95rem', fontFamily: 'system-ui,sans-serif' }}>
                {nomDestinataire}
              </div>
              <div style={{ fontSize: '0.72rem', color: '#9CA3AF', fontFamily: 'system-ui,sans-serif' }}>
                {type === 'COLIS' ? '📦 Conversation colis' : '🚗 Conversation trajet'}
              </div>
            </div>
          </div>
          <button onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.1)', border: 'none',
              width: 32, height: 32, borderRadius: '50%', cursor: 'pointer',
              color: 'white', fontSize: '1.1rem', display: 'flex',
              alignItems: 'center', justifyContent: 'center'
            }}>×</button>
        </div>

        {/* Messages */}
        <div style={{
          flex: 1, overflowY: 'auto', padding: '1rem',
          background: '#F9FAFB', display: 'flex', flexDirection: 'column', gap: '0.5rem'
        }}>
          {loading ? (
            <div style={{ textAlign: 'center', color: '#9CA3AF', fontSize: '0.85rem', fontFamily: 'system-ui,sans-serif', marginTop: '2rem' }}>
              Chargement...
            </div>
          ) : messages.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#9CA3AF', fontFamily: 'system-ui,sans-serif' }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>💬</div>
              <div style={{ fontSize: '0.85rem' }}>Aucun message</div>
              <div style={{ fontSize: '0.78rem', marginTop: '0.3rem' }}>Commencez la conversation !</div>
            </div>
          ) : (
            Object.entries(messagesByDate).map(([date, msgs]) => (
              <div key={date}>
                {/* Séparateur date */}
                <div style={{
                  textAlign: 'center', margin: '0.8rem 0',
                  fontSize: '0.72rem', color: '#9CA3AF',
                  fontFamily: 'system-ui,sans-serif', fontWeight: 600
                }}>
                  {date}
                </div>
                {msgs.map(m => (
                  <div key={m.id} style={{
                    display: 'flex',
                    justifyContent: m.monMessage ? 'flex-end' : 'flex-start',
                    marginBottom: '0.4rem'
                  }}>
                    <div style={{
                      maxWidth: '75%',
                      background: m.monMessage ? '#00875A' : 'white',
                      color: m.monMessage ? 'white' : '#111827',
                      borderRadius: m.monMessage ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                      padding: '0.6rem 0.9rem',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                      border: m.monMessage ? 'none' : '1px solid #E5E7EB'
                    }}>
                      <div style={{ fontSize: '0.88rem', fontFamily: 'system-ui,sans-serif', lineHeight: 1.5 }}>
                        {m.contenu}
                      </div>
                      <div style={{
                        fontSize: '0.65rem', marginTop: '0.3rem',
                        color: m.monMessage ? 'rgba(255,255,255,0.65)' : '#9CA3AF',
                        fontFamily: 'system-ui,sans-serif',
                        display: 'flex', alignItems: 'center',
                        justifyContent: 'flex-end', gap: '0.3rem'
                      }}>
                        {formatTime(m.dateEnvoi)}
                        {m.monMessage && (
                          <span style={{ fontSize: '0.75rem' }}>
                            {m.lu ? '✓✓' : '✓'}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ))
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div style={{
          padding: '0.8rem 1rem', background: 'white',
          borderTop: '1px solid #E5E7EB',
          display: 'flex', gap: '0.6rem', alignItems: 'flex-end'
        }}>
          <textarea
            value={contenu}
            onChange={e => setContenu(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleEnvoyer()
              }
            }}
            placeholder="Votre message..."
            rows={1}
            style={{
              flex: 1, padding: '0.7rem 1rem', border: '1px solid #E5E7EB',
              borderRadius: 20, fontSize: '0.88rem', outline: 'none',
              fontFamily: 'system-ui,sans-serif', color: '#111827',
              resize: 'none', maxHeight: 100, background: '#F9FAFB',
              lineHeight: 1.5
            }}
          />
          <button
            onClick={handleEnvoyer}
            disabled={!contenu.trim() || envoi}
            style={{
              width: 40, height: 40, borderRadius: '50%',
              background: contenu.trim() ? '#00875A' : '#E5E7EB',
              border: 'none', cursor: contenu.trim() ? 'pointer' : 'not-allowed',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0, transition: 'background 0.2s'
            }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
              <path d="M2 21L23 12 2 3v7l15 2-15 2v7z"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}