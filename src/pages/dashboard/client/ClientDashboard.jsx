import Chat from '../../../components/chat/Chat'
import ModalPaiement from '../../../components/paiement/ModalPaiement'
import { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import Header from '../../../components/layout/Header'
import Footer from '../../../components/layout/Footer'
import MapSuivi from '../../../components/map/MapSuivi'
import {
  getMesReservations, getMesColis, getMesNegociations,
  annulerReservation, repondreNegociation,
  evaluerUtilisateur, creerLitige, creerColis,
  getUser, logout, getToken
} from '../../../lib/api'

function Badge({ statut }) {
  const colors = {
    'EN_ATTENTE':         { bg:'#FEF9C3', color:'#713F12' },
    'CONFIRME':           { bg:'#E8F5F0', color:'#00875A' },
    'ANNULE':             { bg:'#FEE2E2', color:'#7F1D1D' },
    'TERMINE':            { bg:'#F3F4F6', color:'#374151' },
    'EN_TRANSIT':         { bg:'#DBEAFE', color:'#1E3A8A' },
    'LIVRE':              { bg:'#E8F5F0', color:'#00875A' },
    'EN_COURS':           { bg:'#FEF9C3', color:'#713F12' },
    'ACCEPTE':            { bg:'#E8F5F0', color:'#00875A' },
    'REFUSE':             { bg:'#FEE2E2', color:'#7F1D1D' },
    'PRIX_PROPOSE':       { bg:'#FEF9C3', color:'#713F12' },
    'CONTRE_OFFRE_CLIENT':{ bg:'#EDE9FE', color:'#4C1D95' },
  }
  const s = colors[statut] || { bg:'#F3F4F6', color:'#374151' }
  return (
    <span style={{ ...s, padding:'0.2rem 0.7rem', borderRadius:20, fontSize:'0.72rem', fontWeight:600, fontFamily:'system-ui,sans-serif' }}>
      {statut?.replace(/_/g,' ')}
    </span>
  )
}

function Card({ children, style, onMouseEnter, onMouseLeave }) {
  return (
    <div style={{ background:'white', borderRadius:12, border:'1px solid #E5E7EB', boxShadow:'0 1px 3px rgba(0,0,0,0.04)', ...style }}
      onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
      {children}
    </div>
  )
}

function Loading() {
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:'0.6rem' }}>
      {[1,2,3].map(i => (
        <div key={i} style={{ background:'white', borderRadius:12, height:60, border:'1px solid #E5E7EB', opacity:0.4 }} />
      ))}
    </div>
  )
}

function AnimatedNumber({ value }) {
  const [display, setDisplay] = useState(0)
  const numVal = parseFloat(value) || 0
  useEffect(() => {
    if (numVal === 0) { setDisplay(0); return }
    let start = 0
    const steps = 40
    const increment = numVal / steps
    const timer = setInterval(() => {
      start += increment
      if (start >= numVal) { setDisplay(numVal); clearInterval(timer) }
      else setDisplay(Math.floor(start))
    }, 800 / steps)
    return () => clearInterval(timer)
  }, [numVal])
  if (isNaN(numVal)) return <span>{value}</span>
  return <span>{display}</span>
}

function BtnChat({ onClick }) {
  return (
    <button onClick={onClick}
      style={{
        background:'#EFF6FF', color:'#1D4ED8',
        border:'1px solid #BFDBFE',
        borderRadius:8, padding:'0.4rem 0.9rem', fontSize:'0.78rem',
        fontWeight:600, cursor:'pointer', fontFamily:'system-ui,sans-serif',
        display:'inline-flex', alignItems:'center', gap:'0.4rem',
        transition:'all 0.15s'
      }}
      onMouseEnter={e => { e.currentTarget.style.background='#DBEAFE'; e.currentTarget.style.transform='translateY(-1px)' }}
      onMouseLeave={e => { e.currentTarget.style.background='#EFF6FF'; e.currentTarget.style.transform='translateY(0)' }}>
       Message
    </button>
  )
}

//  Bouton Payer
function BtnPayer({ onClick }) {
  return (
    <button onClick={onClick}
      style={{
        background:'linear-gradient(135deg,#F59E0B,#D97706)',
        color:'white', border:'none',
        borderRadius:8, padding:'0.4rem 0.9rem', fontSize:'0.78rem',
        fontWeight:600, cursor:'pointer', fontFamily:'system-ui,sans-serif',
        display:'inline-flex', alignItems:'center', gap:'0.4rem',
        transition:'all 0.15s', boxShadow:'0 2px 6px rgba(245,158,11,0.35)'
      }}
      onMouseEnter={e => { e.currentTarget.style.transform='translateY(-1px)'; e.currentTarget.style.boxShadow='0 4px 12px rgba(245,158,11,0.45)' }}
      onMouseLeave={e => { e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.boxShadow='0 2px 6px rgba(245,158,11,0.35)' }}>
      💰 Payer
    </button>
  )
}

const TABS = ['Vue générale', 'Mes réservations', 'Envoyer un colis', 'Mes colis', 'Négociations', 'Évaluations', 'Messages', 'Mon profil']

const emptyColisForm = {
  description:'', poids:'', villeDepart:'', villeArrivee:'',
  nomDestinataire:'', telephoneDestinataire:''
}

const labelStyle = { fontSize:'0.72rem', fontWeight:600, color:'#374151', textTransform:'uppercase', letterSpacing:'0.4px', display:'block', marginBottom:'0.35rem', fontFamily:'system-ui,sans-serif' }
const inputStyle = { width:'100%', padding:'0.75rem 0.9rem', border:'1px solid #D1D5DB', borderRadius:8, fontSize:'0.88rem', outline:'none', fontFamily:'system-ui,sans-serif', color:'#111827', background:'white' }

export default function ClientDashboard() {
  const navigate = useNavigate()
  const user = getUser()
  const [searchParams] = useSearchParams()

  const [tab, setTab] = useState(() => {
    const t = searchParams.get('tab')
    if (t === 'colis') return 'Mes colis'
    return 'Vue générale'
  })

  const [reservations, setReservations] = useState([])
  const [colis, setColis] = useState([])
  const [negociations, setNegociations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [colisStep, setColisStep] = useState(1)
  const [colisForm, setColisForm] = useState(emptyColisForm)
  const [colisCreé, setColisCreé] = useState(null)
  const [colisLoading, setColisLoading] = useState(false)
  const [contrePrixColis, setContrePrixColis] = useState({})

  const [evalForm, setEvalForm] = useState({ evalueId:'', note:5, commentaire:'' })
  const [evalSuccess, setEvalSuccess] = useState('')
  const [litigeForm, setLitigeForm] = useState({ type:'', description:'', accuseId:'' })
  const [litigeSuccess, setLitigeSuccess] = useState('')

  const [chatOuvert, setChatOuvert] = useState(null)

  //  PAIEMENT
  const [paiementOuvert, setPaiementOuvert] = useState(null)
  const [paiementsExistants, setPaiementsExistants] = useState({}) // { 'COLIS-7': true, 'RESA-3': true }

  const [badgesColis, setBadgesColis] = useState(0)
  const [badgesReservations, setBadgesReservations] = useState(0)
  const [totalNonLus, setTotalNonLus] = useState(0)
  const [conversations, setConversations] = useState([])
  const [convLoading, setConvLoading] = useState(false)

  useEffect(() => { chargerDonnees() }, [])

  useEffect(() => {
    const pollBadges = async () => {
      try {
        const [col, res] = await Promise.all([getMesColis(), getMesReservations()])
        const colArr = Array.isArray(col) ? col : []
        const resArr = Array.isArray(res) ? res : []
        setBadgesColis(colArr.filter(c => c.statut === 'PRIX_PROPOSE' || c.statut === 'EN_TRANSIT').length)
        setBadgesReservations(resArr.filter(r => r.statut === 'CONFIRME').length)
      } catch (e) {}
    }
    pollBadges()
    const interval = setInterval(pollBadges, 30000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const pollMessages = async () => {
      try {
        const res = await fetch('http://localhost:8080/api/messages/non-lus', {
          headers: { 'Authorization': `Bearer ${getToken()}` }
        })
        if (res.ok) {
          const data = await res.json()
          setTotalNonLus(data.count || 0)
        }
      } catch (e) {}
    }
    pollMessages()
    const interval = setInterval(pollMessages, 10000)
    return () => clearInterval(interval)
  }, [])

  //  Vérifier paiements existants
  const verifierPaiements = async (colisArr, resArr) => {
    const existants = {}
    await Promise.all([
      ...colisArr.filter(c => ['ACCEPTE','EN_TRANSIT'].includes(c.statut) && c.conducteurId).map(async c => {
        try {
          const r = await fetch(`http://localhost:8080/api/paiements/colis/${c.id}`, {
            headers: { 'Authorization': `Bearer ${getToken()}` }
          })
          if (r.ok) existants[`COLIS-${c.id}`] = true
        } catch (e) {}
      }),
      ...resArr.filter(r => r.statut === 'CONFIRME' && r.conducteurId).map(async r => {
        try {
          const res = await fetch(`http://localhost:8080/api/paiements/reservation/${r.id}`, {
            headers: { 'Authorization': `Bearer ${getToken()}` }
          })
          if (res.ok) existants[`RESA-${r.id}`] = true
        } catch (e) {}
      })
    ])
    setPaiementsExistants(existants)
  }

  const chargerConversations = async () => {
    setConvLoading(true)
    try {
      const res = await fetch('http://localhost:8080/api/messages/mes-conversations', {
        headers: { 'Authorization': `Bearer ${getToken()}` }
      })
      if (res.ok) setConversations(await res.json())
    } catch (e) {}
    finally { setConvLoading(false) }
  }

  const fermerChat = () => {
    setChatOuvert(null)
    setTimeout(() => {
      fetch('http://localhost:8080/api/messages/non-lus', {
        headers: { 'Authorization': `Bearer ${getToken()}` }
      })
        .then(r => r.ok ? r.json() : null)
        .then(d => { if (d) setTotalNonLus(d.count || 0) })
        .catch(() => {})
      if (tab === 'Messages') chargerConversations()
    }, 500)
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return ''
    const d = new Date(dateStr)
    const now = new Date()
    if (d.toDateString() === now.toDateString())
      return d.toLocaleTimeString('fr-FR', { hour:'2-digit', minute:'2-digit' })
    const hier = new Date(now)
    hier.setDate(now.getDate() - 1)
    if (d.toDateString() === hier.toDateString()) return 'Hier'
    return d.toLocaleDateString('fr-FR', { day:'numeric', month:'short' })
  }

  const chargerDonnees = async () => {
    setLoading(true)
    setError('')
    try {
      const [res, col, neg] = await Promise.all([
        getMesReservations(), getMesColis(), getMesNegociations(),
      ])
      const resArr = Array.isArray(res) ? res : []
      const colArr = Array.isArray(col) ? col : []
      setReservations(resArr)
      setColis(colArr)
      setNegociations(Array.isArray(neg) ? neg : [])
      // ✅ Vérifier paiements après chargement
      await verifierPaiements(colArr, resArr)
    } catch (e) {
      setError('Erreur de chargement')
    } finally {
      setLoading(false)
    }
  }

  const handleAnnuler = async (id) => {
    try { await annulerReservation(id); chargerDonnees() }
    catch (e) { setError("Erreur lors de l'annulation") }
  }

  const handleNegociation = async (id, decision) => {
    try { await repondreNegociation(id, decision, null); chargerDonnees() }
    catch (e) { setError('Erreur lors de la négociation') }
  }

  const handleEnvoyerColis = async () => {
    if (!colisForm.description || !colisForm.poids || !colisForm.villeDepart ||
        !colisForm.villeArrivee || !colisForm.nomDestinataire || !colisForm.telephoneDestinataire) {
      setError('Veuillez remplir tous les champs'); return
    }
    setColisLoading(true)
    setError('')
    try {
      const data = await creerColis({ ...colisForm, poids: parseFloat(colisForm.poids) })
      setColisCreé(data)
      setColisStep(3)
      chargerDonnees()
    } catch (e) { setError("Erreur lors de l'envoi") }
    finally { setColisLoading(false) }
  }

  const handleAccepterPrix = async (colisId) => {
    try {
      await fetch(`http://localhost:8080/api/colis/${colisId}/accepter-prix`, {
        method:'PATCH', headers:{ 'Authorization':`Bearer ${getToken()}` }
      })
      chargerDonnees()
    } catch (e) { setError('Erreur') }
  }

  const handleRefuserPrix = async (colisId) => {
    try {
      await fetch(`http://localhost:8080/api/colis/${colisId}/refuser-prix`, {
        method:'PATCH', headers:{ 'Authorization':`Bearer ${getToken()}` }
      })
      chargerDonnees()
    } catch (e) { setError('Erreur') }
  }

  const handleContreProposer = async (colisId) => {
    const prix = parseFloat(contrePrixColis[colisId])
    if (!prix || isNaN(prix)) { setError('Entrez un prix valide'); return }
    try {
      await fetch(`http://localhost:8080/api/colis/${colisId}/contre-proposer`, {
        method:'PATCH',
        headers:{ 'Authorization':`Bearer ${getToken()}`, 'Content-Type':'application/json' },
        body: JSON.stringify({ prix })
      })
      setContrePrixColis({...contrePrixColis, [colisId]: ''})
      chargerDonnees()
    } catch (e) { setError('Erreur lors de la contre-proposition') }
  }

  const handleEvaluer = async () => {
    if (!evalForm.evalueId || !evalForm.note) return
    try {
      await evaluerUtilisateur({ evalueId: parseInt(evalForm.evalueId), note: parseInt(evalForm.note), commentaire: evalForm.commentaire })
      setEvalSuccess('Évaluation envoyée.')
      setEvalForm({ evalueId:'', note:5, commentaire:'' })
      setTimeout(() => setEvalSuccess(''), 3000)
    } catch (e) { setError("Erreur lors de l'évaluation") }
  }

  const handleLitige = async () => {
    if (!litigeForm.type || !litigeForm.accuseId) return
    try {
      await creerLitige({ type: litigeForm.type, description: litigeForm.description, accuseId: parseInt(litigeForm.accuseId) })
      setLitigeSuccess('Litige signalé.')
      setLitigeForm({ type:'', description:'', accuseId:'' })
      setTimeout(() => setLitigeSuccess(''), 3000)
    } catch (e) { setError('Erreur lors du signalement') }
  }

  const handleLogout = () => { logout(); navigate('/') }

  const btnStyle = (color = '#00875A') => ({
    display:'inline-flex', alignItems:'center', gap:'0.4rem',
    padding:'0.65rem 1.4rem', background:color, color:'white',
    border:'none', borderRadius:8, fontWeight:600, fontSize:'0.88rem',
    cursor:'pointer', fontFamily:'system-ui,sans-serif',
    transition:'all 0.2s', boxShadow:'0 2px 6px rgba(0,0,0,0.12)'
  })

  const stats = [
    { val: reservations.length, label: 'Réservations' },
    { val: colis.length, label: 'Colis envoyés' },
    { val: negociations.filter(n=>n.statut==='EN_COURS').length, label: 'Négociations actives' },
    { val: reservations.filter(r=>r.statut==='CONFIRME').length, label: 'Confirmées' },
  ]

  const getBadge = (t) => {
    if (t === 'Mes colis') return badgesColis
    if (t === 'Mes réservations') return badgesReservations
    if (t === 'Messages') return totalNonLus
    return 0
  }

  // Badge paiement en attente
  const aBadgePaiement = (type, id) => !paiementsExistants[`${type}-${id}`]

  return (
    <>
      <style>{`
        @keyframes pulse-badge {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.25); }
        }
        @keyframes slide-in {
          from { opacity:0; transform:translateY(-8px); }
          to   { opacity:1; transform:translateY(0); }
        }
      `}</style>

      <Header />
      <div style={{ marginTop:108, background:'#F9FAFB', minHeight:'100vh' }}>

        <div style={{ background:'#111827', padding:'2rem 3rem' }}>
          <div style={{ maxWidth:1280, margin:'0 auto', display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:'1rem' }}>
            <div style={{ display:'flex', alignItems:'center', gap:'1.2rem' }}>
              <div style={{ position:'relative' }}>
                <div style={{ width:60, height:60, borderRadius:'50%', background:'#00875A', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, fontSize:'1.2rem', color:'white', fontFamily:'system-ui,sans-serif', flexShrink:0, boxShadow:'0 0 0 4px rgba(0,135,90,0.2)' }}>
                  {user?.nom?.split(' ').map(n=>n[0]).join('').toUpperCase().slice(0,2) || 'U'}
                </div>
                {totalNonLus > 0 && (
                  <div style={{ position:'absolute', top:-4, right:-4, background:'#EF4444', color:'white', borderRadius:50, fontSize:'0.62rem', fontWeight:700, padding:'0.1rem 0.4rem', minWidth:18, textAlign:'center', border:'2px solid #111827', lineHeight:1.5, animation:'pulse-badge 1.5s infinite' }}>
                    {totalNonLus}
                  </div>
                )}
              </div>
              <div>
                <div style={{ display:'inline-flex', alignItems:'center', gap:'0.4rem', background:'rgba(255,255,255,0.12)', color:'white', padding:'0.25rem 0.8rem', borderRadius:50, fontSize:'0.75rem', fontWeight:500, fontFamily:'system-ui,sans-serif', marginBottom:6 }}>
                  <span style={{ width:5, height:5, background:'#00875A', borderRadius:'50%', display:'inline-block' }} />
                  Espace client
                </div>
                <div style={{ fontWeight:700, fontSize:'1.4rem', color:'white', fontFamily:'system-ui,sans-serif', letterSpacing:'-0.3px' }}>{user?.nom}</div>
                <div style={{ color:'#6B7280', fontSize:'0.75rem', fontFamily:'system-ui,sans-serif', marginTop:2 }}>{user?.email}</div>
              </div>
            </div>
            <div style={{ display:'flex', gap:'0.8rem', flexWrap:'wrap' }}>
              <Link to="/trajets" style={{ textDecoration:'none' }}>
                <button style={btnStyle()}
                  onMouseEnter={e => { e.currentTarget.style.background='#005C3E'; e.currentTarget.style.transform='translateY(-1px)' }}
                  onMouseLeave={e => { e.currentTarget.style.background='#00875A'; e.currentTarget.style.transform='translateY(0)' }}>
                  Trouver un trajet
                </button>
              </Link>
              <button onClick={() => setTab('Envoyer un colis')} style={btnStyle('#C2410C')}
                onMouseEnter={e => { e.currentTarget.style.background='#9A3412'; e.currentTarget.style.transform='translateY(-1px)' }}
                onMouseLeave={e => { e.currentTarget.style.background='#C2410C'; e.currentTarget.style.transform='translateY(0)' }}>
                Envoyer un colis
              </button>
              <button onClick={handleLogout}
                style={{ padding:'0.65rem 1.2rem', background:'transparent', color:'#9CA3AF', border:'1px solid #374151', borderRadius:8, fontWeight:500, fontSize:'0.85rem', cursor:'pointer', fontFamily:'system-ui,sans-serif', transition:'all 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor='#6B7280'; e.currentTarget.style.color='white' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor='#374151'; e.currentTarget.style.color='#9CA3AF' }}>
                Déconnexion
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ background:'white', borderBottom:'1px solid #E5E7EB', position:'sticky', top:64, zIndex:10 }}>
          <div style={{ maxWidth:1280, margin:'0 auto', padding:'0 3rem', display:'flex', overflowX:'auto' }}>
            {TABS.map(t => {
              const badge = getBadge(t)
              return (
                <button key={t}
                  onClick={() => { setTab(t); if (t === 'Messages') chargerConversations() }}
                  style={{ padding:'0.7rem 1.2rem', border:'none', background:'transparent', cursor:'pointer', fontSize:'0.95rem', fontWeight: tab===t ? 600 : 400, color: tab===t ? '#00875A' : '#6B7280', borderBottom: tab===t ? '2.5px solid #00875A' : '2.5px solid transparent', whiteSpace:'nowrap', fontFamily:'system-ui,sans-serif', transition:'all 0.15s', margin:'0.5rem 0.2rem 0' }}
                  onMouseEnter={e => { if(tab!==t) e.currentTarget.style.color='#111827' }}
                  onMouseLeave={e => { if(tab!==t) e.currentTarget.style.color='#6B7280' }}>
                  {tab === t ? (
                    <span style={{ display:'inline-flex', alignItems:'center', gap:'0.35rem', background:'#E8F5F0', color:'#00875A', padding:'0.35rem 1rem', borderRadius:50, fontSize:'0.92rem', fontWeight:600, fontFamily:'system-ui,sans-serif' }}>
                      <span style={{ width:5, height:5, background:'#00875A', borderRadius:'50%', display:'inline-block' }} />
                      {t}
                      {badge > 0 && <span style={{ background:'#EF4444', color:'white', borderRadius:50, fontSize:'0.65rem', fontWeight:700, padding:'0.1rem 0.45rem', lineHeight:1.4 }}>{badge}</span>}
                    </span>
                  ) : (
                    <span style={{ fontFamily:'system-ui,sans-serif', fontSize:'0.92rem', display:'inline-flex', alignItems:'center', gap:'0.35rem' }}>
                      {t}
                      {badge > 0 && <span style={{ background:'#EF4444', color:'white', borderRadius:50, fontSize:'0.65rem', fontWeight:700, padding:'0.1rem 0.45rem', lineHeight:1.4, display:'inline-block', animation:'pulse-badge 2s infinite' }}>{badge}</span>}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        <div style={{ maxWidth:1280, margin:'0 auto', padding:'2rem 3rem' }}>

          {error && <div style={{ background:'#FEF2F2', color:'#7F1D1D', padding:'0.7rem 1rem', borderRadius:8, marginBottom:'1rem', fontSize:'0.83rem', fontFamily:'system-ui,sans-serif', border:'1px solid #FECACA' }}>{error}</div>}
          {success && <div style={{ background:'#E8F5F0', color:'#00875A', padding:'0.7rem 1rem', borderRadius:8, marginBottom:'1rem', fontSize:'0.83rem', fontFamily:'system-ui,sans-serif', border:'1px solid #A7F3D0' }}>{success}</div>}

          {/* VUE GENERALE */}
          {tab === 'Vue générale' && (
            <div style={{ display:'flex', flexDirection:'column', gap:'1.5rem' }}>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'1rem' }}>
                {stats.map(({ val, label }) => (
                  <Card key={label}
                    style={{ padding:'1.5rem', textAlign:'center', transition:'transform 0.2s, box-shadow 0.2s' }}
                    onMouseEnter={e => { e.currentTarget.style.transform='translateY(-3px)'; e.currentTarget.style.boxShadow='0 8px 24px rgba(0,135,90,0.12)' }}
                    onMouseLeave={e => { e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.boxShadow='0 1px 3px rgba(0,0,0,0.04)' }}>
                    <div style={{ display:'inline-flex', alignItems:'center', justifyContent:'center', width:56, height:56, background:'#E8F5F0', borderRadius:14, marginBottom:'0.8rem' }}>
                      <span style={{ fontSize:'1.3rem', fontWeight:800, color:'#00875A', fontFamily:'system-ui,sans-serif' }}>
                        <AnimatedNumber value={val} />
                      </span>
                    </div>
                    <div style={{ fontSize:'0.8rem', color:'#374151', fontFamily:'system-ui,sans-serif', fontWeight:500 }}>{label}</div>
                  </Card>
                ))}
              </div>

              <Card>
                <div style={{ padding:'1rem 1.5rem', borderBottom:'1px solid #F3F4F6', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                  <span style={{ fontWeight:600, fontSize:'0.9rem', color:'#111827', fontFamily:'system-ui,sans-serif' }}>Dernières réservations</span>
                  <button onClick={() => setTab('Mes réservations')} style={{ color:'#00875A', fontSize:'0.82rem', background:'none', border:'none', cursor:'pointer', fontFamily:'system-ui,sans-serif', fontWeight:500 }}>Voir tout →</button>
                </div>
                {loading ? <div style={{ padding:'1rem' }}><Loading /></div> :
                  reservations.length === 0 ? (
                    <div style={{ padding:'2rem', textAlign:'center', color:'#6B7280', fontSize:'0.85rem', fontFamily:'system-ui,sans-serif' }}>
                      Aucune réservation.
                      <Link to="/trajets" style={{ color:'#00875A', fontWeight:600, textDecoration:'none', marginLeft:6 }}>Trouver un trajet</Link>
                    </div>
                  ) : reservations.slice(0,3).map((r,i,arr) => (
                    <div key={r.id} style={{ padding:'1rem 1.5rem', borderBottom: i<arr.length-1 ? '1px solid #F9FAFB' : 'none', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                      <div>
                        <div style={{ fontWeight:600, color:'#111827', fontSize:'0.9rem', fontFamily:'system-ui,sans-serif' }}>{r.villeDepart} → {r.villeArrivee}</div>
                        <div style={{ fontSize:'0.75rem', color:'#6B7280', marginTop:2, fontFamily:'system-ui,sans-serif' }}>
                          {new Date(r.dateHeure).toLocaleDateString('fr-FR')} · {r.nomConducteur}
                        </div>
                      </div>
                      <div style={{ display:'flex', alignItems:'center', gap:'0.8rem' }}>
                        <span style={{ fontWeight:700, color:'#111827', fontFamily:'system-ui,sans-serif' }}>{r.prixTotal} MAD</span>
                        <Badge statut={r.statut} />
                      </div>
                    </div>
                  ))
                }
              </Card>

              <Card>
                <div style={{ padding:'1rem 1.5rem', borderBottom:'1px solid #F3F4F6', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                  <span style={{ fontWeight:600, fontSize:'0.9rem', color:'#111827', fontFamily:'system-ui,sans-serif' }}>Mes colis en transit</span>
                  <button onClick={() => setTab('Mes colis')} style={{ color:'#00875A', fontSize:'0.82rem', background:'none', border:'none', cursor:'pointer', fontFamily:'system-ui,sans-serif', fontWeight:500 }}>Voir tout →</button>
                </div>
                {loading ? <div style={{ padding:'1rem' }}><Loading /></div> :
                  colis.filter(c=>c.statut==='EN_TRANSIT').length === 0 ? (
                    <div style={{ padding:'2rem', textAlign:'center', color:'#6B7280', fontSize:'0.85rem', fontFamily:'system-ui,sans-serif' }}>Aucun colis en transit.</div>
                  ) : colis.filter(c=>c.statut==='EN_TRANSIT').map(c => (
                    <div key={c.id} style={{ padding:'1rem 1.5rem', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                      <div>
                        <div style={{ fontWeight:600, color:'#111827', fontSize:'0.9rem', fontFamily:'system-ui,sans-serif' }}>{c.description} → {c.villeArrivee}</div>
                        <div style={{ fontSize:'0.75rem', color:'#6B7280', marginTop:2, fontFamily:'system-ui,sans-serif' }}>{c.poids} kg · {c.nomDestinataire}</div>
                      </div>
                      <div style={{ display:'flex', alignItems:'center', gap:'0.8rem' }}>
                        <div style={{ background:'#111827', color:'#FCD34D', padding:'0.3rem 0.8rem', borderRadius:6, fontFamily:'monospace', fontSize:'1rem', fontWeight:700, letterSpacing:4 }}>{c.codeOTP}</div>
                        <Badge statut={c.statut} />
                      </div>
                    </div>
                  ))
                }
              </Card>

              {colis.filter(c => c.statut === 'PRIX_PROPOSE' || c.statut === 'CONTRE_OFFRE_CLIENT').length > 0 && (
                <Card>
                  <div style={{ padding:'1rem 1.5rem', borderBottom:'1px solid #F3F4F6', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                    <span style={{ fontWeight:600, fontSize:'0.9rem', color:'#111827', fontFamily:'system-ui,sans-serif' }}>Négociations colis en cours</span>
                    <button onClick={() => setTab('Mes colis')} style={{ color:'#00875A', fontSize:'0.82rem', background:'none', border:'none', cursor:'pointer', fontFamily:'system-ui,sans-serif', fontWeight:500 }}>Voir tout →</button>
                  </div>
                  {colis.filter(c => c.statut === 'PRIX_PROPOSE').map(c => (
                    <div key={c.id} style={{ padding:'1rem 1.5rem', borderBottom:'1px solid #F9FAFB', display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:'0.5rem' }}>
                      <div>
                        <div style={{ fontWeight:600, color:'#111827', fontSize:'0.88rem', fontFamily:'system-ui,sans-serif' }}>{c.villeDepart} → {c.villeArrivee}</div>
                        <div style={{ fontSize:'0.75rem', color:'#713F12', marginTop:2, fontFamily:'system-ui,sans-serif', fontWeight:600 }}>
                          Prix proposé : {c.prix} MAD par {c.nomConducteur}
                        </div>
                      </div>
                      <div style={{ display:'flex', gap:'0.5rem' }}>
                        <button onClick={() => handleAccepterPrix(c.id)}
                          style={{ background:'#E8F5F0', color:'#00875A', border:'none', borderRadius:6, padding:'0.3rem 0.7rem', fontSize:'0.75rem', fontWeight:600, cursor:'pointer', fontFamily:'system-ui,sans-serif' }}>
                          Accepter
                        </button>
                        <button onClick={() => handleRefuserPrix(c.id)}
                          style={{ background:'#FEE2E2', color:'#7F1D1D', border:'none', borderRadius:6, padding:'0.3rem 0.7rem', fontSize:'0.75rem', fontWeight:600, cursor:'pointer', fontFamily:'system-ui,sans-serif' }}>
                          Refuser
                        </button>
                      </div>
                    </div>
                  ))}
                </Card>
              )}
            </div>
          )}

          {/* MES RESERVATIONS */}
          {tab === 'Mes réservations' && (
            <div style={{ display:'flex', flexDirection:'column', gap:'0.8rem' }}>
              <div style={{ fontWeight:600, fontSize:'0.95rem', color:'#111827', fontFamily:'system-ui,sans-serif', marginBottom:'0.5rem' }}>
                Mes réservations <span style={{ fontWeight:400, color:'#6B7280' }}>({reservations.length})</span>
              </div>
              {loading ? <Loading /> :
                reservations.length === 0 ? (
                  <Card style={{ padding:'3rem', textAlign:'center' }}>
                    <div style={{ fontWeight:500, color:'#374151', marginBottom:'1rem', fontFamily:'system-ui,sans-serif' }}>Aucune réservation</div>
                    <Link to="/trajets" style={{ textDecoration:'none' }}>
                      <button style={btnStyle()}>Trouver un trajet</button>
                    </Link>
                  </Card>
                ) : reservations.map(r => (
                  <Card key={r.id}
                    style={{ padding:'1.1rem 1.5rem', display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:'0.8rem', transition:'box-shadow 0.2s' }}
                    onMouseEnter={e => e.currentTarget.style.boxShadow='0 4px 16px rgba(0,135,90,0.1)'}
                    onMouseLeave={e => e.currentTarget.style.boxShadow='0 1px 3px rgba(0,0,0,0.04)'}>
                    <div>
                      <div style={{ fontWeight:600, color:'#111827', fontSize:'0.92rem', fontFamily:'system-ui,sans-serif' }}>{r.villeDepart} → {r.villeArrivee}</div>
                      <div style={{ fontSize:'0.75rem', color:'#6B7280', marginTop:3, fontFamily:'system-ui,sans-serif' }}>
                        {new Date(r.dateHeure).toLocaleDateString('fr-FR')} · {r.nbPlaces} place(s) · {r.nomConducteur}
                      </div>
                    </div>
                    <div style={{ display:'flex', alignItems:'center', gap:'0.7rem', flexWrap:'wrap' }}>
                      <span style={{ fontWeight:700, color:'#111827', fontFamily:'system-ui,sans-serif' }}>{r.prixTotal} MAD</span>
                      <Badge statut={r.statut} />
                      {r.statut === 'EN_ATTENTE' && (
                        <button onClick={() => handleAnnuler(r.id)}
                          style={{ background:'#FEE2E2', color:'#7F1D1D', border:'none', borderRadius:6, padding:'0.3rem 0.7rem', fontSize:'0.75rem', fontWeight:600, cursor:'pointer', fontFamily:'system-ui,sans-serif' }}>
                          Annuler
                        </button>
                      )}
                      {r.statut !== 'ANNULE' && r.statut !== 'TERMINE' && r.conducteurId && (
                        <BtnChat onClick={() => setChatOuvert({
                          type: 'RESERVATION', refId: r.id,
                          destinataireId: r.conducteurId, nomDestinataire: r.nomConducteur
                        })} />
                      )}
                      {/*  Bouton payer — seulement si CONFIRME et pas encore payé */}
                      {r.statut === 'CONFIRME' && r.conducteurId && aBadgePaiement('RESA', r.id) && (
                        <BtnPayer onClick={() => setPaiementOuvert({
                          type: 'COVOITURAGE',
                          montant: r.prixTotal,
                          reservationId: r.id,
                          beneficiaireId: r.conducteurId,
                          nomBeneficiaire: r.nomConducteur
                        })} />
                      )}
                      {/*  Badge paiement confirmé */}
                      {r.statut === 'CONFIRME' && r.conducteurId && !aBadgePaiement('RESA', r.id) && (
                        <span style={{ background:'#E8F5F0', color:'#00875A', border:'1px solid #A7F3D0', borderRadius:8, padding:'0.4rem 0.8rem', fontSize:'0.75rem', fontWeight:600, fontFamily:'system-ui,sans-serif', display:'inline-flex', alignItems:'center', gap:'0.3rem' }}>
                          ✓ Payé
                        </span>
                      )}
                    </div>
                  </Card>
                ))
              }
            </div>
          )}

          {/* ENVOYER UN COLIS */}
          {tab === 'Envoyer un colis' && (
            <div style={{ maxWidth:600 }}>
              <div style={{ fontWeight:600, fontSize:'0.95rem', color:'#111827', marginBottom:'1.2rem', fontFamily:'system-ui,sans-serif' }}>Envoyer un colis</div>
              <div style={{ display:'flex', alignItems:'center', marginBottom:'1.5rem' }}>
                {[['1','Informations'],['2','Confirmation'],['3','Code OTP']].map(([num,label],i) => (
                  <div key={num} style={{ display:'flex', alignItems:'center', flex: i<2 ? 1 : 'none' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:'0.4rem' }}>
                      <div style={{ width:30, height:30, borderRadius:'50%', background: colisStep>=parseInt(num) ? '#C2410C' : '#E5E7EB', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, fontSize:'0.82rem', color: colisStep>=parseInt(num) ? 'white' : '#9CA3AF', flexShrink:0, fontFamily:'system-ui,sans-serif' }}>{num}</div>
                      <span style={{ fontSize:'0.85rem', fontWeight: colisStep===parseInt(num) ? 600 : 400, color: colisStep===parseInt(num) ? '#111827' : '#9CA3AF', whiteSpace:'nowrap', fontFamily:'system-ui,sans-serif' }}>{label}</span>
                    </div>
                    {i < 2 && <div style={{ flex:1, height:2, background: colisStep>parseInt(num) ? '#C2410C' : '#E5E7EB', margin:'0 0.8rem', borderRadius:2 }} />}
                  </div>
                ))}
              </div>

              {colisStep === 1 && (
                <Card style={{ padding:'1.5rem' }}>
                  <div style={{ fontWeight:600, fontSize:'0.9rem', color:'#111827', marginBottom:'1.2rem', fontFamily:'system-ui,sans-serif' }}>Informations sur le colis</div>
                  <div style={{ background:'#E8F5F0', border:'1px solid #A7F3D0', borderRadius:8, padding:'0.8rem 1rem', marginBottom:'1.2rem', fontSize:'0.8rem', color:'#00875A', fontFamily:'system-ui,sans-serif' }}>
                    Expéditeur : <strong>{user?.nom}</strong> — Le conducteur proposera le prix selon le poids et la distance.
                  </div>
                  {error && <div style={{ background:'#FEF2F2', color:'#7F1D1D', padding:'0.7rem', borderRadius:8, fontSize:'0.82rem', marginBottom:'1rem', fontFamily:'system-ui,sans-serif', border:'1px solid #FECACA' }}>{error}</div>}
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.9rem', marginBottom:'0.9rem' }}>
                    {[['Ville de départ *','text','villeDepart','Ex: Béni Mellal'],['Ville de destination *','text','villeArrivee','Ex: Casablanca']].map(([label,type,key,placeholder]) => (
                      <div key={key}>
                        <label style={labelStyle}>{label}</label>
                        <input type={type} placeholder={placeholder} value={colisForm[key]} onChange={e => setColisForm({...colisForm, [key]: e.target.value})} style={inputStyle} />
                      </div>
                    ))}
                  </div>
                  {[
                    ['Description du contenu *','text','description','Ex: Vêtements, documents...'],
                    ['Poids estimé (kg) *','number','poids','Ex: 2'],
                    ['Nom du destinataire *','text','nomDestinataire','Prénom Nom'],
                    ['Téléphone destinataire *','tel','telephoneDestinataire','06 XX XX XX XX'],
                  ].map(([label,type,key,placeholder]) => (
                    <div key={key} style={{ marginBottom:'0.9rem' }}>
                      <label style={labelStyle}>{label}</label>
                      <input type={type} placeholder={placeholder} value={colisForm[key]} onChange={e => setColisForm({...colisForm, [key]: e.target.value})} style={inputStyle} />
                    </div>
                  ))}
                  <div style={{ background:'#FEF9C3', border:'1px solid #FDE68A', borderRadius:8, padding:'0.8rem 1rem', marginBottom:'1.2rem', fontSize:'0.8rem', color:'#713F12', fontFamily:'system-ui,sans-serif' }}>
                    Le conducteur vous proposera un prix. Vous pourrez l'accepter, le refuser ou négocier.
                  </div>
                  <button onClick={() => { setError(''); setColisStep(2) }}
                    style={{ ...btnStyle('#C2410C'), width:'100%', justifyContent:'center' }}
                    onMouseEnter={e => { e.currentTarget.style.background='#9A3412'; e.currentTarget.style.transform='translateY(-1px)' }}
                    onMouseLeave={e => { e.currentTarget.style.background='#C2410C'; e.currentTarget.style.transform='translateY(0)' }}>
                    Continuer
                  </button>
                </Card>
              )}

              {colisStep === 2 && (
                <Card style={{ padding:'1.5rem' }}>
                  <div style={{ fontWeight:600, fontSize:'0.9rem', color:'#111827', marginBottom:'1.2rem', fontFamily:'system-ui,sans-serif' }}>Confirmer l'envoi</div>
                  <div style={{ background:'#F9FAFB', borderRadius:8, padding:'1.1rem', marginBottom:'1.2rem', border:'1px solid #E5E7EB' }}>
                    {[['Expéditeur', user?.nom],['Départ', colisForm.villeDepart],['Destination', colisForm.villeArrivee],['Contenu', colisForm.description],['Poids', `${colisForm.poids} kg`],['Destinataire', colisForm.nomDestinataire],['Téléphone', colisForm.telephoneDestinataire]].map(([label, val]) => (
                      <div key={label} style={{ display:'flex', justifyContent:'space-between', padding:'0.45rem 0', borderBottom:'1px solid #F3F4F6' }}>
                        <span style={{ fontSize:'0.8rem', color:'#6B7280', fontFamily:'system-ui,sans-serif' }}>{label}</span>
                        <span style={{ fontSize:'0.8rem', color:'#111827', fontWeight:600, fontFamily:'system-ui,sans-serif' }}>{val}</span>
                      </div>
                    ))}
                  </div>
                  <div style={{ background:'#FEF9C3', border:'1px solid #FDE68A', borderRadius:8, padding:'0.8rem 1rem', marginBottom:'1.2rem', fontSize:'0.8rem', color:'#713F12', fontFamily:'system-ui,sans-serif' }}>
                    Votre demande sera visible par les conducteurs qui proposeront un prix.
                  </div>
                  {error && <div style={{ background:'#FEF2F2', color:'#7F1D1D', padding:'0.7rem', borderRadius:8, fontSize:'0.82rem', marginBottom:'1rem', fontFamily:'system-ui,sans-serif', border:'1px solid #FECACA' }}>{error}</div>}
                  <div style={{ display:'flex', gap:'0.8rem' }}>
                    <button onClick={() => setColisStep(1)}
                      style={{ flex:1, padding:'0.85rem', background:'white', color:'#374151', border:'1px solid #D1D5DB', borderRadius:8, fontSize:'0.88rem', fontWeight:500, cursor:'pointer', fontFamily:'system-ui,sans-serif' }}>
                      Modifier
                    </button>
                    <button onClick={handleEnvoyerColis} disabled={colisLoading}
                      style={{ ...btnStyle(colisLoading ? '#9CA3AF' : '#C2410C'), flex:2, justifyContent:'center', cursor: colisLoading ? 'not-allowed' : 'pointer' }}>
                      {colisLoading ? 'Envoi...' : 'Confirmer la demande'}
                    </button>
                  </div>
                </Card>
              )}

              {colisStep === 3 && colisCreé && (
                <Card style={{ padding:'2rem', textAlign:'center' }}>
                  <div style={{ width:56, height:56, borderRadius:'50%', background:'#E8F5F0', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 1rem', fontSize:'1.5rem', color:'#00875A', fontWeight:700 }}>✓</div>
                  <div style={{ fontWeight:700, fontSize:'1.1rem', color:'#111827', marginBottom:'0.4rem', fontFamily:'system-ui,sans-serif' }}>Demande enregistrée</div>
                  <p style={{ color:'#6B7280', fontSize:'0.83rem', marginBottom:'1.2rem', fontFamily:'system-ui,sans-serif' }}>
                    {colisCreé.villeDepart} → {colisCreé.villeArrivee} · {colisCreé.poids} kg
                  </p>
                  <div style={{ background:'#F9FAFB', border:'1px solid #E5E7EB', borderRadius:8, padding:'1rem', marginBottom:'1.2rem' }}>
                    <div style={{ fontSize:'0.72rem', color:'#6B7280', fontWeight:600, marginBottom:'0.5rem', textTransform:'uppercase', fontFamily:'system-ui,sans-serif' }}>Code OTP de livraison</div>
                    <div style={{ background:'#111827', color:'#FCD34D', padding:'0.8rem 1.5rem', borderRadius:8, fontFamily:'monospace', fontSize:'2rem', fontWeight:700, letterSpacing:8, display:'inline-block' }}>
                      {colisCreé.codeOTP}
                    </div>
                    <div style={{ fontSize:'0.75rem', color:'#6B7280', marginTop:'0.6rem', fontFamily:'system-ui,sans-serif' }}>
                      Communiquez ce code uniquement au destinataire <strong>{colisCreé.nomDestinataire}</strong>
                    </div>
                  </div>
                  <div style={{ background:'#DBEAFE', border:'1px solid #BFDBFE', borderRadius:8, padding:'0.8rem 1rem', marginBottom:'1.2rem', fontSize:'0.8rem', color:'#1E3A8A', fontFamily:'system-ui,sans-serif' }}>
                    Un conducteur va prendre en charge votre colis et vous proposera un prix.
                  </div>
                  <div style={{ display:'flex', gap:'0.8rem', justifyContent:'center' }}>
                    <button onClick={() => setTab('Mes colis')} style={btnStyle()}>Voir mes colis</button>
                    <button onClick={() => { setColisStep(1); setColisForm(emptyColisForm); setColisCreé(null) }}
                      style={{ background:'white', color:'#374151', border:'1px solid #D1D5DB', borderRadius:8, padding:'0.65rem 1.2rem', fontWeight:500, fontSize:'0.85rem', cursor:'pointer', fontFamily:'system-ui,sans-serif' }}>
                      Nouveau colis
                    </button>
                  </div>
                </Card>
              )}
            </div>
          )}

          {/* MES COLIS */}
          {tab === 'Mes colis' && (
            <div style={{ display:'flex', flexDirection:'column', gap:'0.8rem' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'0.5rem' }}>
                <span style={{ fontWeight:600, fontSize:'0.95rem', color:'#111827', fontFamily:'system-ui,sans-serif' }}>
                  Mes colis <span style={{ fontWeight:400, color:'#6B7280' }}>({colis.length})</span>
                </span>
                <button onClick={() => setTab('Envoyer un colis')} style={btnStyle('#C2410C')}
                  onMouseEnter={e => { e.currentTarget.style.background='#9A3412'; e.currentTarget.style.transform='translateY(-1px)' }}
                  onMouseLeave={e => { e.currentTarget.style.background='#C2410C'; e.currentTarget.style.transform='translateY(0)' }}>
                  Nouveau colis
                </button>
              </div>
              {loading ? <Loading /> :
                colis.length === 0 ? (
                  <Card style={{ padding:'3rem', textAlign:'center' }}>
                    <div style={{ fontWeight:500, color:'#374151', marginBottom:'1rem', fontFamily:'system-ui,sans-serif' }}>Aucun colis envoyé</div>
                    <button onClick={() => setTab('Envoyer un colis')} style={btnStyle('#C2410C')}>Envoyer un colis</button>
                  </Card>
                ) : colis.map(c => (
                  <Card key={c.id} style={{ padding:'1.2rem 1.5rem', transition:'box-shadow 0.2s' }}
                    onMouseEnter={e => e.currentTarget.style.boxShadow='0 4px 16px rgba(0,0,0,0.08)'}
                    onMouseLeave={e => e.currentTarget.style.boxShadow='0 1px 3px rgba(0,0,0,0.04)'}>
                    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:'0.8rem', marginBottom:(c.statut==='PRIX_PROPOSE'||c.statut==='CONTRE_OFFRE_CLIENT'||c.statut==='EN_TRANSIT'||c.statut==='ACCEPTE') ? '1rem' : 0 }}>
                      <div>
                        <div style={{ fontWeight:600, fontSize:'0.92rem', color:'#111827', fontFamily:'system-ui,sans-serif' }}>{c.villeDepart} → {c.villeArrivee}</div>
                        <div style={{ fontSize:'0.75rem', color:'#6B7280', marginTop:3, fontFamily:'system-ui,sans-serif' }}>
                          {c.description} · {c.poids} kg · Destinataire : {c.nomDestinataire}
                        </div>
                        {c.nomConducteur && <div style={{ fontSize:'0.73rem', color:'#00875A', marginTop:2, fontWeight:600, fontFamily:'system-ui,sans-serif' }}>Conducteur : {c.nomConducteur}</div>}
                      </div>
                      <div style={{ display:'flex', alignItems:'center', gap:'0.6rem', flexWrap:'wrap' }}>
                        <Badge statut={c.statut} />
                        {c.statut !== 'LIVRE' && c.conducteurId && (
                          <BtnChat onClick={() => setChatOuvert({
                            type: 'COLIS', refId: c.id,
                            destinataireId: c.conducteurId, nomDestinataire: c.nomConducteur
                          })} />
                        )}
                        {/*  Bouton payer colis — ACCEPTE ou EN_TRANSIT et pas encore payé */}
                        {['ACCEPTE','EN_TRANSIT'].includes(c.statut) && c.conducteurId && aBadgePaiement('COLIS', c.id) && (
                          <BtnPayer onClick={() => setPaiementOuvert({
                            type: 'COLIS',
                            montant: c.prix,
                            colisId: c.id,
                            beneficiaireId: c.conducteurId,
                            nomBeneficiaire: c.nomConducteur
                          })} />
                        )}
                        {/*  Badge payé */}
                        {['ACCEPTE','EN_TRANSIT'].includes(c.statut) && c.conducteurId && !aBadgePaiement('COLIS', c.id) && (
                          <span style={{ background:'#E8F5F0', color:'#00875A', border:'1px solid #A7F3D0', borderRadius:8, padding:'0.4rem 0.8rem', fontSize:'0.75rem', fontWeight:600, fontFamily:'system-ui,sans-serif', display:'inline-flex', alignItems:'center', gap:'0.3rem' }}>
                            ✓ Payé
                          </span>
                        )}
                      </div>
                    </div>

                    {c.statut === 'EN_TRANSIT' && (
                      <div style={{ paddingTop:'1rem', borderTop:'1px solid #F3F4F6' }}>
                        <div style={{ display:'flex', alignItems:'center', gap:'1rem', flexWrap:'wrap', marginBottom:'1rem' }}>
                          <span style={{ fontSize:'0.75rem', color:'#6B7280', fontFamily:'system-ui,sans-serif' }}>Code OTP :</span>
                          <div style={{ background:'#111827', color:'#FCD34D', padding:'0.35rem 0.9rem', borderRadius:6, fontFamily:'monospace', fontSize:'1.1rem', fontWeight:700, letterSpacing:5 }}>{c.codeOTP}</div>
                          <span style={{ fontSize:'0.72rem', color:'#9CA3AF', fontFamily:'system-ui,sans-serif' }}>À communiquer uniquement au destinataire</span>
                        </div>
                        <MapSuivi colisId={c.id} mode="client" positionClient={null} nomDestinataire={c.nomDestinataire} getToken={getToken} />
                      </div>
                    )}

                    {c.statut === 'PRIX_PROPOSE' && (
                      <div style={{ paddingTop:'1rem', borderTop:'1px solid #F3F4F6' }}>
                        <div style={{ background:'#FEF9C3', borderRadius:8, padding:'0.9rem 1rem', marginBottom:'0.9rem', border:'1px solid #FDE68A', display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:'0.5rem' }}>
                          <div>
                            <div style={{ fontSize:'0.72rem', color:'#713F12', fontFamily:'system-ui,sans-serif', fontWeight:600, textTransform:'uppercase', marginBottom:2 }}>
                              Prix proposé par {c.nomConducteur}
                            </div>
                            <div style={{ fontSize:'1.5rem', fontWeight:800, color:'#713F12', fontFamily:'system-ui,sans-serif' }}>{c.prix} MAD</div>
                          </div>
                          <div style={{ fontSize:'0.75rem', color:'#92400E', fontFamily:'system-ui,sans-serif' }}>
                            Acceptez, refusez ou proposez votre prix
                          </div>
                        </div>
                        <div style={{ display:'flex', gap:'0.6rem', flexWrap:'wrap', alignItems:'center' }}>
                          <button onClick={() => handleAccepterPrix(c.id)}
                            style={{ ...btnStyle(), padding:'0.55rem 1.2rem' }}
                            onMouseEnter={e => { e.currentTarget.style.background='#005C3E'; e.currentTarget.style.transform='translateY(-1px)' }}
                            onMouseLeave={e => { e.currentTarget.style.background='#00875A'; e.currentTarget.style.transform='translateY(0)' }}>
                            Accepter {c.prix} MAD
                          </button>
                          <div style={{ display:'flex', gap:'0.4rem', flex:1, minWidth:200 }}>
                            <input type="number" placeholder="Votre prix MAD"
                              value={contrePrixColis[c.id] || ''}
                              onChange={e => setContrePrixColis({...contrePrixColis, [c.id]: e.target.value})}
                              style={{ flex:1, padding:'0.55rem 0.8rem', border:'1px solid #D1D5DB', borderRadius:8, fontSize:'0.85rem', outline:'none', fontFamily:'system-ui,sans-serif', color:'#111827' }} />
                            <button onClick={() => handleContreProposer(c.id)}
                              style={{ background:'#111827', color:'white', border:'none', borderRadius:8, padding:'0.55rem 1rem', fontWeight:600, fontSize:'0.82rem', cursor:'pointer', fontFamily:'system-ui,sans-serif', whiteSpace:'nowrap' }}
                              onMouseEnter={e => { e.currentTarget.style.background='#374151'; e.currentTarget.style.transform='translateY(-1px)' }}
                              onMouseLeave={e => { e.currentTarget.style.background='#111827'; e.currentTarget.style.transform='translateY(0)' }}>
                              Négocier
                            </button>
                          </div>
                          <button onClick={() => handleRefuserPrix(c.id)}
                            style={{ background:'#FEE2E2', color:'#7F1D1D', border:'none', borderRadius:8, padding:'0.55rem 0.9rem', fontWeight:600, fontSize:'0.82rem', cursor:'pointer', fontFamily:'system-ui,sans-serif' }}>
                            Refuser
                          </button>
                        </div>
                      </div>
                    )}

                    {c.statut === 'CONTRE_OFFRE_CLIENT' && (
                      <div style={{ paddingTop:'1rem', borderTop:'1px solid #F3F4F6' }}>
                        <div style={{ background:'#EDE9FE', borderRadius:8, padding:'0.9rem 1rem', border:'1px solid #DDD6FE', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                          <div>
                            <div style={{ fontSize:'0.72rem', color:'#4C1D95', fontFamily:'system-ui,sans-serif', fontWeight:600, textTransform:'uppercase', marginBottom:2 }}>Votre contre-offre envoyée</div>
                            <div style={{ fontSize:'1.5rem', fontWeight:800, color:'#4C1D95', fontFamily:'system-ui,sans-serif' }}>{c.prix} MAD</div>
                          </div>
                          <div style={{ fontSize:'0.75rem', color:'#5B21B6', fontFamily:'system-ui,sans-serif', fontStyle:'italic' }}>
                            En attente de réponse du conducteur...
                          </div>
                        </div>
                      </div>
                    )}

                    {c.statut === 'ACCEPTE' && c.prix && (
                      <div style={{ paddingTop:'0.8rem', borderTop:'1px solid #F3F4F6' }}>
                        <div style={{ fontSize:'0.75rem', color:'#374151', fontFamily:'system-ui,sans-serif' }}>
                          Prix convenu : <strong style={{ color:'#00875A' }}>{c.prix} MAD</strong> · En attente de démarrage par le conducteur
                        </div>
                      </div>
                    )}
                  </Card>
                ))
              }
            </div>
          )}

          {/* NEGOCIATIONS */}
          {tab === 'Négociations' && (
            <div style={{ display:'flex', flexDirection:'column', gap:'0.8rem' }}>
              <span style={{ fontWeight:600, fontSize:'0.95rem', color:'#111827', fontFamily:'system-ui,sans-serif', marginBottom:'0.5rem', display:'block' }}>Mes négociations covoiturage</span>
              {loading ? <Loading /> :
                negociations.length === 0 ? (
                  <Card style={{ padding:'3rem', textAlign:'center' }}>
                    <div style={{ fontWeight:500, color:'#374151', fontFamily:'system-ui,sans-serif' }}>Aucune négociation</div>
                  </Card>
                ) : negociations.map(n => (
                  <Card key={n.id} style={{ padding:'1.2rem 1.5rem' }}>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1rem', flexWrap:'wrap', gap:'0.5rem' }}>
                      <div style={{ fontWeight:600, fontSize:'0.92rem', color:'#111827', fontFamily:'system-ui,sans-serif' }}>{n.villeDepart} → {n.villeArrivee}</div>
                      <Badge statut={n.statut} />
                    </div>
                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem', marginBottom: n.statut==='EN_COURS' && n.offreConducteur ? '1rem' : 0 }}>
                      <div style={{ background:'#E8F5F0', borderRadius:10, padding:'1rem', textAlign:'center', border:'1px solid #A7F3D0' }}>
                        <div style={{ fontSize:'0.7rem', color:'#00875A', marginBottom:4, fontFamily:'system-ui,sans-serif', fontWeight:600, textTransform:'uppercase' }}>Mon offre</div>
                        <div style={{ fontSize:'1.5rem', fontWeight:800, color:'#005C3E', fontFamily:'system-ui,sans-serif' }}>{n.offreClient} MAD</div>
                      </div>
                      <div style={{ background:'#F9FAFB', borderRadius:10, padding:'1rem', textAlign:'center', border:'1px solid #E5E7EB' }}>
                        <div style={{ fontSize:'0.7rem', color:'#6B7280', marginBottom:4, fontFamily:'system-ui,sans-serif', fontWeight:600, textTransform:'uppercase' }}>Offre conducteur</div>
                        <div style={{ fontSize:'1.5rem', fontWeight:800, color:'#111827', fontFamily:'system-ui,sans-serif' }}>{n.offreConducteur ? `${n.offreConducteur} MAD` : '—'}</div>
                      </div>
                    </div>
                    {n.statut === 'EN_COURS' && n.offreConducteur && (
                      <div style={{ display:'flex', gap:'0.6rem' }}>
                        <button onClick={() => handleNegociation(n.id, 'ACCEPTE')}
                          style={{ background:'#E8F5F0', color:'#00875A', border:'none', borderRadius:8, padding:'0.55rem 1.1rem', fontWeight:600, fontSize:'0.85rem', cursor:'pointer', fontFamily:'system-ui,sans-serif' }}>
                          Accepter {n.offreConducteur} MAD
                        </button>
                        <button onClick={() => handleNegociation(n.id, 'REFUSE')}
                          style={{ background:'#FEE2E2', color:'#7F1D1D', border:'none', borderRadius:8, padding:'0.55rem 1rem', fontWeight:600, fontSize:'0.85rem', cursor:'pointer', fontFamily:'system-ui,sans-serif' }}>
                          Refuser
                        </button>
                      </div>
                    )}
                  </Card>
                ))
              }
            </div>
          )}

          {/* EVALUATIONS */}
          {tab === 'Évaluations' && (
            <div style={{ display:'flex', flexDirection:'column', gap:'1.2rem', maxWidth:560 }}>
              <span style={{ fontWeight:600, fontSize:'0.95rem', color:'#111827', fontFamily:'system-ui,sans-serif' }}>Évaluations & Litiges</span>
              <Card style={{ padding:'1.5rem' }}>
                <div style={{ fontWeight:600, fontSize:'0.88rem', color:'#111827', marginBottom:'1rem', fontFamily:'system-ui,sans-serif' }}>Évaluer un conducteur</div>
                {evalSuccess && <div style={{ background:'#E8F5F0', color:'#00875A', padding:'0.7rem', borderRadius:8, marginBottom:'1rem', fontSize:'0.82rem', fontFamily:'system-ui,sans-serif', border:'1px solid #A7F3D0' }}>{evalSuccess}</div>}
                <div style={{ marginBottom:'0.9rem' }}>
                  <label style={labelStyle}>ID du conducteur *</label>
                  <input type="number" placeholder="Ex: 3" value={evalForm.evalueId} onChange={e => setEvalForm({...evalForm, evalueId: e.target.value})} style={inputStyle} />
                </div>
                <div style={{ marginBottom:'0.9rem' }}>
                  <label style={labelStyle}>Note *</label>
                  <div style={{ display:'flex', gap:'0.4rem' }}>
                    {[1,2,3,4,5].map(n => (
                      <button key={n} onClick={() => setEvalForm({...evalForm, note:n})}
                        style={{ width:40, height:40, borderRadius:8, border:'1.5px solid', borderColor: evalForm.note>=n ? '#FCD34D' : '#E5E7EB', background: evalForm.note>=n ? '#FFFBEB' : 'white', fontSize:'1rem', cursor:'pointer' }}>
                        
                      </button>
                    ))}
                    <span style={{ display:'flex', alignItems:'center', fontWeight:700, fontSize:'0.9rem', color:'#111827', marginLeft:'0.4rem', fontFamily:'system-ui,sans-serif' }}>{evalForm.note}/5</span>
                  </div>
                </div>
                <div style={{ marginBottom:'1rem' }}>
                  <label style={labelStyle}>Commentaire</label>
                  <textarea placeholder="Votre avis..." value={evalForm.commentaire} onChange={e => setEvalForm({...evalForm, commentaire: e.target.value})} rows={3} style={{ ...inputStyle, resize:'vertical' }} />
                </div>
                <button onClick={handleEvaluer} style={{ ...btnStyle(), width:'100%', justifyContent:'center' }}>Envoyer l'évaluation</button>
              </Card>
              <Card style={{ padding:'1.5rem' }}>
                <div style={{ fontWeight:600, fontSize:'0.88rem', color:'#111827', marginBottom:'1rem', fontFamily:'system-ui,sans-serif' }}>Signaler un litige</div>
                {litigeSuccess && <div style={{ background:'#E8F5F0', color:'#00875A', padding:'0.7rem', borderRadius:8, marginBottom:'1rem', fontSize:'0.82rem', fontFamily:'system-ui,sans-serif', border:'1px solid #A7F3D0' }}>{litigeSuccess}</div>}
                <div style={{ marginBottom:'0.9rem' }}>
                  <label style={labelStyle}>Type de litige *</label>
                  <select value={litigeForm.type} onChange={e => setLitigeForm({...litigeForm, type: e.target.value})} style={{ ...inputStyle, background:'white' }}>
                    <option value="">Sélectionner...</option>
                    <option value="Colis non livré">Colis non livré</option>
                    <option value="Prix non respecté">Prix non respecté</option>
                    <option value="Conducteur absent">Conducteur absent</option>
                    <option value="Comportement inapproprié">Comportement inapproprié</option>
                    <option value="Autre">Autre</option>
                  </select>
                </div>
                <div style={{ marginBottom:'0.9rem' }}>
                  <label style={labelStyle}>ID du conducteur *</label>
                  <input type="number" placeholder="Ex: 3" value={litigeForm.accuseId} onChange={e => setLitigeForm({...litigeForm, accuseId: e.target.value})} style={inputStyle} />
                </div>
                <div style={{ marginBottom:'1rem' }}>
                  <label style={labelStyle}>Description</label>
                  <textarea placeholder="Décrivez le problème..." value={litigeForm.description} onChange={e => setLitigeForm({...litigeForm, description: e.target.value})} rows={3} style={{ ...inputStyle, resize:'vertical' }} />
                </div>
                <button onClick={handleLitige} style={{ ...btnStyle('#7F1D1D'), width:'100%', justifyContent:'center' }}>Signaler le litige</button>
              </Card>
            </div>
          )}

          {/* MESSAGES */}
          {tab === 'Messages' && (
            <div style={{ maxWidth:680 }}>
              <div style={{ fontWeight:600, fontSize:'0.95rem', color:'#111827', marginBottom:'1.2rem', fontFamily:'system-ui,sans-serif', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                <span>Messages {totalNonLus > 0 && <span style={{ background:'#EF4444', color:'white', borderRadius:50, fontSize:'0.65rem', fontWeight:700, padding:'0.1rem 0.45rem', marginLeft:'0.4rem' }}>{totalNonLus}</span>}</span>
                <button onClick={chargerConversations}
                  style={{ background:'none', border:'1px solid #E5E7EB', color:'#374151', cursor:'pointer', fontSize:'0.82rem', fontFamily:'system-ui,sans-serif', fontWeight:500, borderRadius:8, padding:'0.4rem 0.9rem', display:'inline-flex', alignItems:'center', gap:'0.3rem' }}>
                   Actualiser
                </button>
              </div>
              {convLoading ? <Loading /> :
                conversations.length === 0 ? (
                  <Card style={{ padding:'3rem', textAlign:'center' }}>
                    <div style={{ fontSize:'3rem', marginBottom:'0.8rem' }}>💬</div>
                    <div style={{ fontWeight:600, color:'#374151', fontFamily:'system-ui,sans-serif', marginBottom:'0.4rem' }}>Aucune conversation</div>
                    <div style={{ fontSize:'0.8rem', color:'#9CA3AF', fontFamily:'system-ui,sans-serif' }}>Vos conversations avec les conducteurs apparaîtront ici</div>
                  </Card>
                ) : (
                  <div style={{ display:'flex', flexDirection:'column', gap:'0.4rem' }}>
                    {conversations.map(conv => (
                      <div key={`${conv.typeConversation}-${conv.referenceId}`}
                        onClick={() => setChatOuvert({ type: conv.typeConversation, refId: conv.referenceId, destinataireId: conv.interlocuteurId, nomDestinataire: conv.nomInterlocuteur })}
                        style={{ borderRadius:12, border: conv.nonLus > 0 ? '1.5px solid #BFDBFE' : '1px solid #E5E7EB', padding:'1rem 1.2rem', display:'flex', alignItems:'center', gap:'1rem', cursor:'pointer', transition:'all 0.15s', boxShadow: conv.nonLus > 0 ? '0 2px 8px rgba(59,130,246,0.12)' : '0 1px 3px rgba(0,0,0,0.04)', background: conv.nonLus > 0 ? '#F0F7FF' : 'white' }}
                        onMouseEnter={e => { e.currentTarget.style.transform='translateY(-1px)'; e.currentTarget.style.boxShadow='0 4px 16px rgba(0,0,0,0.1)' }}
                        onMouseLeave={e => { e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.boxShadow = conv.nonLus > 0 ? '0 2px 8px rgba(59,130,246,0.12)' : '0 1px 3px rgba(0,0,0,0.04)' }}>
                        <div style={{ position:'relative', flexShrink:0 }}>
                          <div style={{ width:50, height:50, borderRadius:'50%', background: conv.nonLus > 0 ? '#1D4ED8' : '#E8F5F0', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, fontSize:'1rem', color: conv.nonLus > 0 ? 'white' : '#00875A', fontFamily:'system-ui,sans-serif' }}>
                            {conv.nomInterlocuteur?.split(' ').map(n=>n[0]).join('').toUpperCase().slice(0,2) || '??'}
                          </div>
                          {conv.nonLus > 0 && (
                            <div style={{ position:'absolute', top:-2, right:-2, background:'#EF4444', color:'white', borderRadius:50, fontSize:'0.6rem', fontWeight:700, padding:'0.1rem 0.35rem', minWidth:16, textAlign:'center', border:'2px solid white', lineHeight:1.4, animation:'pulse-badge 1.5s infinite' }}>
                              {conv.nonLus}
                            </div>
                          )}
                        </div>
                        <div style={{ flex:1, minWidth:0 }}>
                          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'0.25rem' }}>
                            <div style={{ fontWeight: conv.nonLus > 0 ? 700 : 600, fontSize:'0.92rem', color:'#111827', fontFamily:'system-ui,sans-serif' }}>{conv.nomInterlocuteur}</div>
                            <div style={{ fontSize:'0.7rem', color: conv.nonLus > 0 ? '#3B82F6' : '#9CA3AF', fontFamily:'system-ui,sans-serif', flexShrink:0, fontWeight: conv.nonLus > 0 ? 600 : 400 }}>{formatDate(conv.dateDernierMessage)}</div>
                          </div>
                          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', gap:'0.5rem' }}>
                            <div style={{ fontSize:'0.8rem', color: conv.nonLus > 0 ? '#1D4ED8' : '#6B7280', fontFamily:'system-ui,sans-serif', fontWeight: conv.nonLus > 0 ? 600 : 400, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', flex:1 }}>
                              {conv.dernierMessage?.length > 55 ? conv.dernierMessage.slice(0, 55) + '...' : conv.dernierMessage || '—'}
                            </div>
                            <div style={{ fontSize:'0.65rem', fontFamily:'system-ui,sans-serif', background: conv.typeConversation === 'COLIS' ? '#FEF0EC' : '#E8F5F0', color: conv.typeConversation === 'COLIS' ? '#C2410C' : '#00875A', padding:'0.15rem 0.5rem', borderRadius:20, flexShrink:0, fontWeight:600 }}>
                              {conv.typeConversation === 'COLIS' ? '📦 Colis' : '🚗 Trajet'}
                            </div>
                          </div>
                        </div>
                        <div style={{ color:'#D1D5DB', fontSize:'1.2rem', flexShrink:0 }}>›</div>
                      </div>
                    ))}
                  </div>
                )
              }
            </div>
          )}

          {/* MON PROFIL */}
          {tab === 'Mon profil' && (
            <div style={{ maxWidth:480 }}>
              <div style={{ fontWeight:600, fontSize:'0.95rem', color:'#111827', marginBottom:'1.2rem', fontFamily:'system-ui,sans-serif' }}>Mon profil</div>
              <Card style={{ padding:'1.5rem' }}>
                <div style={{ display:'flex', alignItems:'center', gap:'1rem', marginBottom:'1.5rem', paddingBottom:'1.5rem', borderBottom:'1px solid #F3F4F6' }}>
                  <div style={{ width:64, height:64, borderRadius:'50%', background:'#00875A', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, fontSize:'1.3rem', color:'white', fontFamily:'system-ui,sans-serif', flexShrink:0, boxShadow:'0 0 0 3px rgba(0,135,90,0.15)' }}>
                    {user?.nom?.split(' ').map(n=>n[0]).join('').toUpperCase().slice(0,2) || 'U'}
                  </div>
                  <div>
                    <div style={{ fontWeight:700, fontSize:'1rem', color:'#111827', fontFamily:'system-ui,sans-serif' }}>{user?.nom}</div>
                    <div style={{ fontSize:'0.78rem', color:'#6B7280', marginTop:2, fontFamily:'system-ui,sans-serif' }}>{user?.email}</div>
                    <div style={{ display:'inline-flex', alignItems:'center', gap:'0.4rem', background:'#E8F5F0', color:'#00875A', padding:'0.2rem 0.7rem', borderRadius:50, fontSize:'0.72rem', fontWeight:600, marginTop:6, fontFamily:'system-ui,sans-serif' }}>
                      <span style={{ width:5, height:5, background:'#00875A', borderRadius:'50%' }} />
                      Client vérifié
                    </div>
                  </div>
                </div>
                {[['Nom complet', user?.nom, 'text'],['Email', user?.email, 'email']].map(([label,value,type]) => (
                  <div key={label} style={{ marginBottom:'0.9rem' }}>
                    <label style={labelStyle}>{label}</label>
                    <input type={type} defaultValue={value} style={{ ...inputStyle, background:'#F9FAFB' }} />
                  </div>
                ))}
                <button style={{ ...btnStyle(), width:'100%', justifyContent:'center' }}
                  onMouseEnter={e => { e.currentTarget.style.background='#005C3E'; e.currentTarget.style.transform='translateY(-1px)' }}
                  onMouseLeave={e => { e.currentTarget.style.background='#00875A'; e.currentTarget.style.transform='translateY(0)' }}>
                  Sauvegarder
                </button>
              </Card>
            </div>
          )}

        </div>
      </div>

      {/* CHAT MODAL */}
      {chatOuvert && (
        <Chat type={chatOuvert.type} refId={chatOuvert.refId} destinataireId={chatOuvert.destinataireId} nomDestinataire={chatOuvert.nomDestinataire} onClose={fermerChat} />
      )}

      {/*  MODAL PAIEMENT */}
      {paiementOuvert && (
        <ModalPaiement
          type={paiementOuvert.type}
          montant={paiementOuvert.montant}
          colisId={paiementOuvert.colisId}
          reservationId={paiementOuvert.reservationId}
          beneficiaireId={paiementOuvert.beneficiaireId}
          nomBeneficiaire={paiementOuvert.nomBeneficiaire}
          onClose={() => setPaiementOuvert(null)}
          onSuccess={() => { chargerDonnees(); setPaiementOuvert(null) }}
        />
      )}

      <Footer />
    </>
  )
}