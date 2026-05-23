import Chat from '../../../components/chat/Chat' 
import MapSuivi from '../../../components/map/MapSuivi'
import InfosBancairesForm from '../../../components/paiement/InfosBancairesForm'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../../../components/layout/Header'
import Footer from '../../../components/layout/Footer'
import {
  getMesTrajets, creerTrajet,
  repondreNegociation, uploadDocuments, getUser, logout
} from '../../../lib/api'

function Badge({ statut }) {
  const s = {
    'ACTIF':               { bg:'#E8F5F0', color:'#00875A' },
    'INACTIF':             { bg:'#F3F4F6', color:'#374151' },
    'TERMINE':             { bg:'#F3F4F6', color:'#374151' },
    'ANNULE':              { bg:'#FEE2E2', color:'#7F1D1D' },
    'EN_COURS':            { bg:'#FEF9C3', color:'#713F12' },
    'ACCEPTE':             { bg:'#E8F5F0', color:'#00875A' },
    'REFUSE':              { bg:'#FEE2E2', color:'#7F1D1D' },
    'EN_ATTENTE':          { bg:'#DBEAFE', color:'#1E3A8A' },
    'PRIX_PROPOSE':        { bg:'#FEF9C3', color:'#713F12' },
    'CONTRE_OFFRE_CLIENT': { bg:'#EDE9FE', color:'#4C1D95' },
    'EN_TRANSIT':          { bg:'#DBEAFE', color:'#1E3A8A' },
    'LIVRE':               { bg:'#E8F5F0', color:'#00875A' },
  }[statut] || { bg:'#F3F4F6', color:'#374151' }
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

function AnimatedNumber({ value, suffix = '' }) {
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
  if (isNaN(numVal)) return <span>{value}{suffix}</span>
  return <span>{display}{suffix}</span>
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

const TABS = ['Vue générale', 'Mes trajets', 'Négociations', 'Documents', 'Mes livraisons', 'Messages', 'Mon profil']

const emptyForm = {
  villeDepart:'', villeArrivee:'', dateHeure:'',
  placesDisponibles:'', prixParPlace:'', volumeCoffre:'', description:''
}

const emptyOffreForm = {
  villeDepart:'', villeArrivee:'', prixParKg:'', poidsMax:'', description:''
}

export default function ConducteurDashboard() {
  const navigate = useNavigate()
  const user = getUser()
  const estVerifie = user?.estVerifie !== false

  const [chatOuvert, setChatOuvert] = useState(null)
  const [tab, setTab] = useState('Vue générale')
  const [trajets, setTrajets] = useState([])
  const [negociations, setNegociations] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [formLoading, setFormLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [contre, setContre] = useState('')
  const [conducteurInfo, setConducteurInfo] = useState(null)
  const [docForm, setDocForm] = useState({
    permis:null, cin:null, photoVoiture:null,
    carteGrise:null, marqueVoiture:'', photoProfile:null
  })
  const [docSuccess, setDocSuccess] = useState('')
  const [docLoading, setDocLoading] = useState(false)
  const [offresLivraison, setOffresLivraison] = useState([])
  const [colisATraiter, setColisATraiter] = useState([])
  const [mesLivraisons, setMesLivraisons] = useState([])
  const [otpSaisie, setOtpSaisie] = useState({})
  const [prixSaisie, setPrixSaisie] = useState({})
  const [livraisonSuccess, setLivraisonSuccess] = useState('')
  const [showOffreForm, setShowOffreForm] = useState(false)
  const [offreForm, setOffreForm] = useState(emptyOffreForm)
  const [offreLoading, setOffreLoading] = useState(false)

  const [badgesLivraisons, setBadgesLivraisons] = useState(0)
  const [badgesNegociations, setBadgesNegociations] = useState(0)
  const [totalNonLus, setTotalNonLus] = useState(0)
  const [conversations, setConversations] = useState([])
  const [convLoading, setConvLoading] = useState(false)

  //  PAIEMENTS
  const [paiementsAValider, setPaiementsAValider] = useState([])
  const [noteValidation, setNoteValidation] = useState({})

  const token = () => localStorage.getItem('token')
  const authHeader = () => ({ 'Authorization': `Bearer ${token()}` })
  const authJsonHeader = () => ({ 'Authorization': `Bearer ${token()}`, 'Content-Type': 'application/json' })

  useEffect(() => { chargerDonnees() }, [])

  useEffect(() => {
    const pollBadges = async () => {
      try {
        const [demRes, negRes] = await Promise.all([
          fetch('http://localhost:8080/api/colis/mes-demandes', { headers: authHeader() }),
          fetch('http://localhost:8080/api/negociations/mes-negociations-conducteur', { headers: authHeader() })
        ])
        if (demRes.ok) {
          const d = await demRes.json()
          setBadgesLivraisons(Array.isArray(d) ? d.filter(c => c.statut === 'CONTRE_OFFRE_CLIENT' || c.statut === 'EN_ATTENTE').length : 0)
        }
        if (negRes.ok) {
          const n = await negRes.json()
          setBadgesNegociations(Array.isArray(n) ? n.filter(x => x.statut === 'EN_COURS').length : 0)
        }
      } catch (e) {}
    }
    pollBadges()
    const interval = setInterval(pollBadges, 30000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const pollMessages = async () => {
      try {
        const res = await fetch('http://localhost:8080/api/messages/non-lus', { headers: authHeader() })
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

  // Polling paiements à valider toutes les 30s
  useEffect(() => {
    const pollPaiements = async () => {
      try {
        const res = await fetch('http://localhost:8080/api/paiements/a-valider', { headers: authHeader() })
        if (res.ok) setPaiementsAValider(await res.json())
      } catch (e) {}
    }
    pollPaiements()
    const interval = setInterval(pollPaiements, 30000)
    return () => clearInterval(interval)
  }, [])

  const chargerConversations = async () => {
    setConvLoading(true)
    try {
      const res = await fetch('http://localhost:8080/api/messages/mes-conversations', { headers: authHeader() })
      if (res.ok) setConversations(await res.json())
    } catch (e) {}
    finally { setConvLoading(false) }
  }

  const fermerChat = () => {
    setChatOuvert(null)
    setTimeout(() => {
      fetch('http://localhost:8080/api/messages/non-lus', { headers: authHeader() })
        .then(r => r.ok ? r.json() : null)
        .then(d => { if (d) setTotalNonLus(d.count || 0) })
        .catch(() => {})
      if (tab === 'Messages') chargerConversations()
    }, 500)
  }

  const chargerDonnees = async () => {
    setLoading(true)
    setError('')
    try {
      const traj = await getMesTrajets()
      setTrajets(Array.isArray(traj) ? traj : [])

      const negRes = await fetch('http://localhost:8080/api/negociations/mes-negociations-conducteur', { headers: authHeader() })
      const negData = negRes.ok ? await negRes.json() : []
      setNegociations(Array.isArray(negData) ? negData : [])

      try {
        const res = await fetch('http://localhost:8080/api/conducteurs/moi', { headers: authHeader() })
        if (res.ok) setConducteurInfo(await res.json())
      } catch (e) {}

      try {
        const offRes = await fetch('http://localhost:8080/api/offres-livraison/mes-offres', { headers: authHeader() })
        if (offRes.ok) setOffresLivraison(await offRes.json())
      } catch (e) {}

      try {
        const livRes = await fetch('http://localhost:8080/api/colis/mes-livraisons', { headers: authHeader() })
        if (livRes.ok) setMesLivraisons(await livRes.json())
      } catch (e) {}

      try {
        const demRes = await fetch('http://localhost:8080/api/colis/mes-demandes', { headers: authHeader() })
        if (demRes.ok) {
          const demandes = await demRes.json()
          setColisATraiter(Array.isArray(demandes) ? demandes.filter(c => c.statut === 'EN_ATTENTE' || c.statut === 'CONTRE_OFFRE_CLIENT') : [])
        }
      } catch (e) {}

      // Charger paiements à valider
      try {
        const paiRes = await fetch('http://localhost:8080/api/paiements/a-valider', { headers: authHeader() })
        if (paiRes.ok) setPaiementsAValider(await paiRes.json())
      } catch (e) {}

    } catch (e) {
      setError('Erreur de chargement')
    } finally {
      setLoading(false)
    }
  }

  //  Valider réception paiement
  const handleValiderPaiement = async (paiementId) => {
    setError('')
    try {
      const res = await fetch(`http://localhost:8080/api/paiements/${paiementId}/valider`, {
        method: 'PATCH', headers: authJsonHeader(),
        body: JSON.stringify({ note: noteValidation[paiementId] || 'Paiement bien reçu, merci !' })
      })
      if (!res.ok) throw new Error()
      setSuccess(' Paiement validé !')
      setNoteValidation(prev => { const n = {...prev}; delete n[paiementId]; return n })
      chargerDonnees()
      setTimeout(() => setSuccess(''), 4000)
    } catch (e) { setError('Erreur lors de la validation') }
  }

  //  Contester paiement
  const handleContesterPaiement = async (paiementId) => {
    const note = noteValidation[paiementId]
    if (!note?.trim()) { setError('Indiquez le motif de la contestation'); return }
    setError('')
    try {
      const res = await fetch(`http://localhost:8080/api/paiements/${paiementId}/contester`, {
        method: 'PATCH', headers: authJsonHeader(),
        body: JSON.stringify({ note })
      })
      if (!res.ok) throw new Error()
      setSuccess('Contestation envoyée au client.')
      chargerDonnees()
      setTimeout(() => setSuccess(''), 4000)
    } catch (e) { setError('Erreur lors de la contestation') }
  }

  const handleCreerTrajet = async () => {
    if (!form.villeDepart || !form.villeArrivee || !form.dateHeure || !form.placesDisponibles || !form.prixParPlace) {
      setError('Veuillez remplir tous les champs obligatoires'); return
    }
    setFormLoading(true); setError('')
    try {
      await creerTrajet({
        ...form,
        placesDisponibles: parseInt(form.placesDisponibles),
        prixParPlace: parseFloat(form.prixParPlace),
        volumeCoffre: form.volumeCoffre ? parseFloat(form.volumeCoffre) : null,
      })
      setSuccess('Trajet publié.')
      setShowForm(false); setForm(emptyForm)
      chargerDonnees()
      setTimeout(() => setSuccess(''), 3000)
    } catch (e) { setError('Erreur lors de la publication') }
    finally { setFormLoading(false) }
  }

  const handlePublierOffre = async () => {
    if (!offreForm.villeDepart || !offreForm.villeArrivee || !offreForm.prixParKg || !offreForm.poidsMax) {
      setError('Veuillez remplir tous les champs'); return
    }
    setOffreLoading(true)
    try {
      const res = await fetch('http://localhost:8080/api/offres-livraison', {
        method: 'POST', headers: authJsonHeader(),
        body: JSON.stringify({ ...offreForm, prixParKg: parseFloat(offreForm.prixParKg), poidsMax: parseFloat(offreForm.poidsMax) })
      })
      if (!res.ok) throw new Error()
      setSuccess('Offre publiée !')
      setShowOffreForm(false); setOffreForm(emptyOffreForm)
      chargerDonnees()
      setTimeout(() => setSuccess(''), 3000)
    } catch (e) { setError("Erreur lors de la publication") }
    finally { setOffreLoading(false) }
  }

  const handleDesactiverOffre = async (offreId) => {
    setError('')
    try {
      const res = await fetch(`http://localhost:8080/api/offres-livraison/${offreId}/desactiver`, { method: 'PATCH', headers: authHeader() })
      if (!res.ok) { const msg = await res.text(); throw new Error(msg || 'Erreur serveur') }
      setSuccess('Offre désactivée.')
      chargerDonnees()
      setTimeout(() => setSuccess(''), 3000)
    } catch (e) { setError(`Impossible de désactiver : ${e.message}`) }
  }

  const handleProposerPrix = async (colisId) => {
    const prix = prixSaisie[colisId]
    if (!prix) { setError('Entrez un prix'); return }
    try {
      const res = await fetch(`http://localhost:8080/api/colis/${colisId}/proposer-prix`, {
        method: 'PATCH', headers: authJsonHeader(), body: JSON.stringify({ prix: parseFloat(prix) })
      })
      if (!res.ok) throw new Error()
      setLivraisonSuccess('Prix proposé !')
      setPrixSaisie({...prixSaisie, [colisId]: ''})
      chargerDonnees()
      setTimeout(() => setLivraisonSuccess(''), 3000)
    } catch (e) { setError('Erreur lors de la proposition') }
  }

  const handleAccepterContreOffre = async (colisId, prix) => {
    setError('')
    try {
      const res = await fetch(`http://localhost:8080/api/colis/${colisId}/accepter-contre-offre`, { method: 'PATCH', headers: authHeader() })
      if (!res.ok) { const msg = await res.text(); throw new Error(msg || 'Erreur serveur') }
      setLivraisonSuccess(`Prix de ${prix} MAD accepté !`)
      chargerDonnees()
      setTimeout(() => setLivraisonSuccess(''), 3000)
    } catch (e) { setError(`Erreur : ${e.message}`) }
  }

  const handleRefuserPrix = async (colisId) => {
    setError('')
    try {
      const res = await fetch(`http://localhost:8080/api/colis/${colisId}/refuser-prix`, { method: 'PATCH', headers: authHeader() })
      if (!res.ok) throw new Error()
      setLivraisonSuccess('Demande refusée.')
      chargerDonnees()
      setTimeout(() => setLivraisonSuccess(''), 3000)
    } catch (e) { setError('Erreur lors du refus') }
  }

  const handleDemarrer = async (colisId) => {
    setError('')
    try {
      const res = await fetch(`http://localhost:8080/api/colis/${colisId}/demarrer`, { method: 'PATCH', headers: authHeader() })
      if (!res.ok) throw new Error()
      setLivraisonSuccess('Livraison démarrée !')
      chargerDonnees()
      setTimeout(() => setLivraisonSuccess(''), 3000)
    } catch (e) { setError('Erreur lors du démarrage') }
  }

  const handleValiderOTP = async (colisId) => {
    const otp = otpSaisie[colisId]
    if (!otp || otp.length !== 6) { setError('OTP de 6 chiffres requis'); return }
    setError('')
    try {
      const res = await fetch(`http://localhost:8080/api/colis/${colisId}/valider-livraison?otp=${otp}`, { method: 'PATCH', headers: authHeader() })
      if (!res.ok) throw new Error()
      setLivraisonSuccess('Livraison confirmée !')
      setOtpSaisie({...otpSaisie, [colisId]: ''})
      chargerDonnees()
      setTimeout(() => setLivraisonSuccess(''), 3000)
    } catch (e) { setError('Code OTP incorrect ou expiré') }
  }

  const handleRepondre = async (id, decision, offreContre) => {
    try { await repondreNegociation(id, decision, offreContre || null); chargerDonnees() }
    catch (e) { setError('Erreur') }
  }

  const handleSoumettreDocuments = async () => {
    if (!docForm.permis || !docForm.cin || !docForm.photoVoiture || !docForm.photoProfile) {
      setError('Tous les documents obligatoires sont requis'); return
    }
    if (!docForm.marqueVoiture) { setError('Indiquez la marque du véhicule'); return }
    setDocLoading(true)
    try {
      const formData = new FormData()
      formData.append('permis', docForm.permis)
      formData.append('cin', docForm.cin)
      formData.append('photoVoiture', docForm.photoVoiture)
      formData.append('photoProfile', docForm.photoProfile)
      if (docForm.carteGrise) formData.append('carteGrise', docForm.carteGrise)
      formData.append('marqueVoiture', docForm.marqueVoiture)
      await uploadDocuments(formData)
      setDocSuccess('Documents soumis.')
      setDocForm({ permis:null, cin:null, photoVoiture:null, carteGrise:null, marqueVoiture:'', photoProfile:null })
      setTimeout(() => setDocSuccess(''), 5000)
    } catch (e) { setError('Erreur lors de la soumission') }
    finally { setDocLoading(false) }
  }

  const handleLogout = () => { logout(); navigate('/') }

  const inputStyle = { width:'100%', padding:'0.75rem 0.9rem', border:'1px solid #D1D5DB', borderRadius:8, fontSize:'0.88rem', outline:'none', fontFamily:'system-ui,sans-serif', color:'#111827', background:'white' }
  const labelStyle = { fontSize:'0.72rem', fontWeight:600, color:'#374151', textTransform:'uppercase', letterSpacing:'0.4px', display:'block', marginBottom:'0.35rem', fontFamily:'system-ui,sans-serif' }

  const btnStyle = (color='#00875A') => ({
    display:'inline-flex', alignItems:'center', gap:'0.4rem',
    padding:'0.65rem 1.4rem', background:color, color:'white',
    border:'none', borderRadius:8, fontWeight:600, fontSize:'0.88rem',
    cursor:'pointer', fontFamily:'system-ui,sans-serif',
    transition:'all 0.2s', boxShadow:'0 2px 6px rgba(0,0,0,0.12)'
  })

  const volumeTotal = trajets.reduce((acc,t) => acc + (t.prixParPlace || 0), 0)
  const stats = [
    { val: trajets.length, label: 'Trajets publiés', suffix: '' },
    { val: trajets.filter(t=>t.statut==='ACTIF').length, label: 'Trajets actifs', suffix: '' },
    { val: negociations.filter(n=>n.statut==='EN_COURS').length, label: 'Négociations', suffix: '' },
    { val: volumeTotal, label: 'Volume total', suffix: ' MAD' },
  ]

  const getBadge = (t) => {
    if (t === 'Mes livraisons') return badgesLivraisons
    if (t === 'Négociations') return badgesNegociations
    if (t === 'Messages') return totalNonLus
    //  Badge paiements à valider sur Vue générale
    if (t === 'Vue générale') return paiementsAValider.length
    return 0
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
        @keyframes pulse-gold {
          0%, 100% { box-shadow: 0 0 0 0 rgba(245,158,11,0.4); }
          50% { box-shadow: 0 0 0 8px rgba(245,158,11,0); }
        }
      `}</style>

      <Header />
      <div style={{ marginTop:108, background:'#F9FAFB', minHeight:'100vh' }}>

        {/* Hero */}
        <div style={{ background:'#111827', padding:'2rem 3rem' }}>
          <div style={{ maxWidth:1280, margin:'0 auto', display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:'1rem' }}>
            <div style={{ display:'flex', alignItems:'center', gap:'1.2rem' }}>
              <div style={{ position:'relative' }}>
                <div style={{ width:60, height:60, borderRadius:'50%', overflow:'hidden', border:'2.5px solid rgba(0,135,90,0.5)', flexShrink:0, boxShadow:'0 0 0 4px rgba(0,135,90,0.15)' }}>
                  {conducteurInfo?.photoProfile ? (
                    <img src={`http://localhost:8080/api/documents/fichier/${conducteurInfo.photoProfile}`}
                      alt={user?.nom} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                  ) : (
                    <div style={{ width:'100%', height:'100%', background:'#00875A', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, fontSize:'1.2rem', color:'white', fontFamily:'system-ui,sans-serif' }}>
                      {user?.nom?.split(' ').map(n=>n[0]).join('').toUpperCase().slice(0,2) || 'C'}
                    </div>
                  )}
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
                  Espace conducteur
                </div>
                <div style={{ fontWeight:700, fontSize:'1.4rem', color:'white', fontFamily:'system-ui,sans-serif', letterSpacing:'-0.3px' }}>{user?.nom}</div>
                <div style={{ color:'#6B7280', fontSize:'0.75rem', fontFamily:'system-ui,sans-serif', marginTop:2 }}>{user?.email}</div>
              </div>
            </div>
            <div style={{ display:'flex', gap:'0.8rem', flexWrap:'wrap' }}>
              <button
                onClick={() => estVerifie ? setShowForm(true) : null}
                disabled={!estVerifie}
                style={{ ...btnStyle(estVerifie ? '#00875A' : '#374151'), cursor: estVerifie ? 'pointer' : 'not-allowed' }}
                onMouseEnter={e => { if(estVerifie) { e.currentTarget.style.background='#005C3E'; e.currentTarget.style.transform='translateY(-1px)' }}}
                onMouseLeave={e => { e.currentTarget.style.background = estVerifie ? '#00875A' : '#374151'; e.currentTarget.style.transform='translateY(0)' }}>
                {estVerifie ? '+ Publier un trajet' : 'En attente de validation'}
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

        {!estVerifie && (
          <div style={{ background:'#FFFBEB', borderBottom:'1px solid #FDE68A', padding:'0.8rem 3rem' }}>
            <div style={{ maxWidth:1280, margin:'0 auto', fontSize:'0.83rem', color:'#92400E', fontFamily:'system-ui,sans-serif' }}>
              <strong>Compte en attente de validation</strong> — Vos documents sont en cours de vérification.
            </div>
          </div>
        )}

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
                      {badge > 0 && (
                        <span style={{ background: t === 'Vue générale' ? '#F59E0B' : '#EF4444', color:'white', borderRadius:50, fontSize:'0.65rem', fontWeight:700, padding:'0.1rem 0.45rem', lineHeight:1.4 }}>
                          {badge}
                        </span>
                      )}
                    </span>
                  ) : (
                    <span style={{ fontFamily:'system-ui,sans-serif', fontSize:'0.92rem', display:'inline-flex', alignItems:'center', gap:'0.35rem' }}>
                      {t}
                      {badge > 0 && (
                        <span style={{ background: t === 'Vue générale' ? '#F59E0B' : '#EF4444', color:'white', borderRadius:50, fontSize:'0.65rem', fontWeight:700, padding:'0.1rem 0.45rem', lineHeight:1.4, display:'inline-block', animation:'pulse-badge 2s infinite' }}>
                          {badge}
                        </span>
                      )}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* Modals */}
        {showForm && (
          <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.55)', zIndex:2000, display:'flex', alignItems:'center', justifyContent:'center', padding:'1rem' }}>
            <div style={{ background:'white', borderRadius:14, padding:'2rem', width:'100%', maxWidth:480, maxHeight:'90vh', overflowY:'auto', boxShadow:'0 24px 64px rgba(0,0,0,0.25)' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.5rem' }}>
                <div>
                  <div style={{ display:'inline-flex', alignItems:'center', gap:'0.4rem', background:'#E8F5F0', color:'#00875A', padding:'0.2rem 0.7rem', borderRadius:50, fontSize:'0.72rem', fontWeight:600, marginBottom:6, fontFamily:'system-ui,sans-serif' }}>
                    <span style={{ width:4, height:4, background:'#00875A', borderRadius:'50%' }} /> Nouveau trajet
                  </div>
                  <h3 style={{ fontWeight:700, fontSize:'1.1rem', color:'#111827', fontFamily:'system-ui,sans-serif', margin:0 }}>Publier un trajet</h3>
                </div>
                <button onClick={() => { setShowForm(false); setError('') }}
                  style={{ background:'#F3F4F6', border:'none', width:32, height:32, borderRadius:'50%', cursor:'pointer', color:'#6B7280', fontSize:'1.1rem', display:'flex', alignItems:'center', justifyContent:'center' }}>×</button>
              </div>
              {error && <div style={{ background:'#FEF2F2', color:'#7F1D1D', padding:'0.7rem', borderRadius:8, fontSize:'0.82rem', marginBottom:'1rem', fontFamily:'system-ui,sans-serif', border:'1px solid #FECACA' }}>{error}</div>}
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.9rem', marginBottom:'0.9rem' }}>
                {[['Ville de départ *','text','villeDepart','Ex: Béni Mellal'],["Ville d'arrivée *",'text','villeArrivee','Ex: Casablanca']].map(([label,type,key,placeholder]) => (
                  <div key={key}>
                    <label style={labelStyle}>{label}</label>
                    <input type={type} placeholder={placeholder} value={form[key]} onChange={e => setForm({...form, [key]: e.target.value})} style={inputStyle} />
                  </div>
                ))}
              </div>
              {[['Date et heure *','datetime-local','dateHeure',''],['Nombre de places *','number','placesDisponibles','4'],['Prix par place (MAD) *','number','prixParPlace','80'],['Volume coffre (kg)','number','volumeCoffre',''],['Description','text','description','Informations...']].map(([label,type,key,placeholder]) => (
                <div key={key} style={{ marginBottom:'0.9rem' }}>
                  <label style={labelStyle}>{label}</label>
                  <input type={type} placeholder={placeholder} value={form[key]} onChange={e => setForm({...form, [key]: e.target.value})} style={inputStyle} />
                </div>
              ))}
              <button onClick={handleCreerTrajet} disabled={formLoading}
                style={{ ...btnStyle(formLoading ? '#9CA3AF' : '#00875A'), width:'100%', justifyContent:'center', marginTop:'0.5rem', cursor: formLoading ? 'not-allowed' : 'pointer' }}>
                {formLoading ? 'Publication...' : 'Publier le trajet'}
              </button>
            </div>
          </div>
        )}

        {showOffreForm && (
          <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.55)', zIndex:2000, display:'flex', alignItems:'center', justifyContent:'center', padding:'1rem' }}>
            <div style={{ background:'white', borderRadius:14, padding:'2rem', width:'100%', maxWidth:480, boxShadow:'0 24px 64px rgba(0,0,0,0.25)' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.5rem' }}>
                <div>
                  <div style={{ display:'inline-flex', alignItems:'center', gap:'0.4rem', background:'#FEF0EC', color:'#C2410C', padding:'0.2rem 0.7rem', borderRadius:50, fontSize:'0.72rem', fontWeight:600, marginBottom:6, fontFamily:'system-ui,sans-serif' }}>
                    <span style={{ width:4, height:4, background:'#C2410C', borderRadius:'50%' }} /> Nouvelle offre
                  </div>
                  <h3 style={{ fontWeight:700, fontSize:'1.1rem', color:'#111827', fontFamily:'system-ui,sans-serif', margin:0 }}>Offre de livraison</h3>
                </div>
                <button onClick={() => { setShowOffreForm(false); setError('') }}
                  style={{ background:'#F3F4F6', border:'none', width:32, height:32, borderRadius:'50%', cursor:'pointer', color:'#6B7280', fontSize:'1.1rem', display:'flex', alignItems:'center', justifyContent:'center' }}>×</button>
              </div>
              {error && <div style={{ background:'#FEF2F2', color:'#7F1D1D', padding:'0.7rem', borderRadius:8, fontSize:'0.82rem', marginBottom:'1rem', fontFamily:'system-ui,sans-serif', border:'1px solid #FECACA' }}>{error}</div>}
              <div style={{ background:'#FEF9C3', border:'1px solid #FDE68A', borderRadius:8, padding:'0.7rem 1rem', marginBottom:'1.2rem', fontSize:'0.8rem', color:'#713F12', fontFamily:'system-ui,sans-serif' }}>
                Les clients verront votre offre et pourront vous envoyer des demandes de colis.
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.9rem', marginBottom:'0.9rem' }}>
                {[['Départ *','villeDepart','Ex: Béni Mellal'],["Arrivée *",'villeArrivee','Ex: Casablanca']].map(([label,key,placeholder]) => (
                  <div key={key}>
                    <label style={labelStyle}>{label}</label>
                    <input type="text" placeholder={placeholder} value={offreForm[key]} onChange={e => setOffreForm({...offreForm, [key]: e.target.value})} style={inputStyle} />
                  </div>
                ))}
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.9rem', marginBottom:'0.9rem' }}>
                <div>
                  <label style={labelStyle}>Prix par kg (MAD) *</label>
                  <input type="number" placeholder="Ex: 5" value={offreForm.prixParKg} onChange={e => setOffreForm({...offreForm, prixParKg: e.target.value})} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Poids max (kg) *</label>
                  <input type="number" placeholder="Ex: 20" value={offreForm.poidsMax} onChange={e => setOffreForm({...offreForm, poidsMax: e.target.value})} style={inputStyle} />
                </div>
              </div>
              <div style={{ marginBottom:'1.2rem' }}>
                <label style={labelStyle}>Description</label>
                <input type="text" placeholder="Ex: Fragile accepté..." value={offreForm.description} onChange={e => setOffreForm({...offreForm, description: e.target.value})} style={inputStyle} />
              </div>
              <button onClick={handlePublierOffre} disabled={offreLoading}
                style={{ ...btnStyle(offreLoading ? '#9CA3AF' : '#C2410C'), width:'100%', justifyContent:'center', cursor: offreLoading ? 'not-allowed' : 'pointer' }}>
                {offreLoading ? 'Publication...' : "Publier l'offre"}
              </button>
            </div>
          </div>
        )}

        <div style={{ maxWidth:1280, margin:'0 auto', padding:'2rem 3rem' }}>

          {error && !showForm && !showOffreForm && <div style={{ background:'#FEF2F2', color:'#7F1D1D', padding:'0.7rem 1rem', borderRadius:8, marginBottom:'1rem', fontSize:'0.83rem', fontFamily:'system-ui,sans-serif', border:'1px solid #FECACA' }}>{error}</div>}
          {success && <div style={{ background:'#E8F5F0', color:'#00875A', padding:'0.7rem 1rem', borderRadius:8, marginBottom:'1rem', fontSize:'0.83rem', fontFamily:'system-ui,sans-serif', border:'1px solid #A7F3D0' }}>{success}</div>}

          {totalNonLus > 0 && tab !== 'Messages' && (
            <div onClick={() => { setTab('Messages'); chargerConversations() }}
              style={{ background:'linear-gradient(135deg, #1D4ED8 0%, #2563EB 100%)', borderRadius:12, padding:'1rem 1.5rem', marginBottom:'1.2rem', display:'flex', alignItems:'center', gap:'1rem', fontFamily:'system-ui,sans-serif', boxShadow:'0 4px 16px rgba(29,78,216,0.25)', animation:'slide-in 0.3s ease', cursor:'pointer', transition:'opacity 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.opacity='0.92'}
              onMouseLeave={e => e.currentTarget.style.opacity='1'}>
              <div style={{ fontSize:'1.6rem', flexShrink:0 }}>💬</div>
              <div style={{ flex:1 }}>
                <div style={{ fontWeight:700, color:'white', fontSize:'0.92rem' }}>{totalNonLus} nouveau{totalNonLus > 1 ? 'x' : ''} message{totalNonLus > 1 ? 's' : ''} non lu{totalNonLus > 1 ? 's' : ''}</div>
                <div style={{ fontSize:'0.75rem', color:'rgba(255,255,255,0.75)', marginTop:2 }}>Cliquer pour voir vos messages →</div>
              </div>
              <div style={{ background:'white', color:'#1D4ED8', borderRadius:50, fontSize:'0.82rem', fontWeight:800, padding:'0.3rem 0.9rem', minWidth:28, textAlign:'center' }}>{totalNonLus}</div>
            </div>
          )}

          {/* VUE GENERALE */}
          {tab === 'Vue générale' && (
            <div style={{ display:'flex', flexDirection:'column', gap:'1.5rem' }}>

              {/* PAIEMENTS À VALIDER — Style P2P Binance */}
              {paiementsAValider.length > 0 && (
                <Card style={{ border:'2px solid #F59E0B', overflow:'hidden' }}>
                  <div style={{ padding:'1rem 1.5rem', background:'linear-gradient(135deg,#FFFBEB,#FEF3C7)', borderBottom:'1px solid #FDE68A', display:'flex', alignItems:'center', gap:'0.8rem' }}>
                    <div style={{ width:36, height:36, borderRadius:'50%', background:'#F59E0B', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1rem', animation:'pulse-gold 2s infinite' }}>
                      💰
                    </div>
                    <div style={{ flex:1 }}>
                      <div style={{ fontWeight:700, fontSize:'0.9rem', color:'#713F12', fontFamily:'system-ui,sans-serif' }}>
                        {paiementsAValider.length} paiement{paiementsAValider.length > 1 ? 's' : ''} en attente de validation
                      </div>
                      <div style={{ fontSize:'0.72rem', color:'#92400E', fontFamily:'system-ui,sans-serif', marginTop:1 }}>
                        Confirmez ou contestez les paiements reçus
                      </div>
                    </div>
                    <span style={{ background:'#F59E0B', color:'white', borderRadius:50, fontSize:'0.65rem', fontWeight:700, padding:'0.15rem 0.6rem', animation:'pulse-badge 1.5s infinite' }}>
                      ACTION REQUISE
                    </span>
                  </div>

                  {paiementsAValider.map((p, i) => (
                    <div key={p.id} style={{ padding:'1.2rem 1.5rem', borderBottom: i < paiementsAValider.length - 1 ? '1px solid #FEF9C3' : 'none' }}>
                      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'0.9rem', flexWrap:'wrap', gap:'0.5rem' }}>
                        <div>
                          <div style={{ display:'flex', alignItems:'center', gap:'0.6rem', marginBottom:4 }}>
                            <div style={{ width:38, height:38, borderRadius:'50%', background:'#E8F5F0', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, color:'#00875A', fontFamily:'system-ui,sans-serif', fontSize:'0.85rem', flexShrink:0 }}>
                              {p.nomPayeur?.split(' ').map(n=>n[0]).join('').toUpperCase().slice(0,2) || '??'}
                            </div>
                            <div>
                              <div style={{ fontWeight:700, fontSize:'0.9rem', color:'#111827', fontFamily:'system-ui,sans-serif' }}>{p.nomPayeur}</div>
                              <div style={{ fontSize:'0.72rem', color:'#6B7280', fontFamily:'system-ui,sans-serif' }}>
                                {p.type === 'COVOITURAGE' ? '🚗 Covoiturage' : '📦 Livraison colis'}
                              </div>
                            </div>
                          </div>
                          <div style={{ fontSize:'0.72rem', color:'#9CA3AF', fontFamily:'system-ui,sans-serif' }}>
                            Déclaré le {new Date(p.datePaiementClient).toLocaleString('fr-FR')}
                          </div>
                        </div>
                        <div style={{ textAlign:'right' }}>
                          <div style={{ fontWeight:800, fontSize:'1.6rem', color:'#00875A', fontFamily:'system-ui,sans-serif', lineHeight:1 }}>{p.montant}</div>
                          <div style={{ fontSize:'0.72rem', color:'#6B7280', fontFamily:'system-ui,sans-serif' }}>MAD</div>
                          <div style={{ marginTop:4, display:'inline-flex', alignItems:'center', gap:'0.3rem', background:'#DBEAFE', color:'#1E3A8A', padding:'0.2rem 0.6rem', borderRadius:50, fontSize:'0.7rem', fontWeight:600, fontFamily:'system-ui,sans-serif' }}>
                            {p.methode === 'ESPECES' ? '💵 Espèces' : p.methode === 'VIREMENT' ? '🏦 Virement' : '💳 CMI'}
                          </div>
                        </div>
                      </div>

                      {/* Référence client */}
                      {p.referenceClient && (
                        <div style={{ background:'#F9FAFB', border:'1px solid #E5E7EB', borderRadius:8, padding:'0.7rem 1rem', marginBottom:'0.9rem', display:'flex', alignItems:'center', gap:'0.8rem' }}>
                          <div style={{ flex:1 }}>
                            <div style={{ fontSize:'0.68rem', color:'#6B7280', fontFamily:'system-ui,sans-serif', marginBottom:2, textTransform:'uppercase', fontWeight:600 }}>
                              Référence de transaction fournie
                            </div>
                            <div style={{ fontFamily:'monospace', fontWeight:700, color:'#111827', fontSize:'0.9rem' }}>{p.referenceClient}</div>
                          </div>
                          <div style={{ fontSize:'1.2rem' }}>🔍</div>
                        </div>
                      )}

                      {/* Instruction espèces */}
                      {p.methode === 'ESPECES' && (
                        <div style={{ background:'#FFFBEB', border:'1px solid #FDE68A', borderRadius:8, padding:'0.7rem 1rem', marginBottom:'0.9rem', fontSize:'0.78rem', color:'#92400E', fontFamily:'system-ui,sans-serif' }}>
                           Le client confirme vous avoir remis <strong>{p.montant} MAD</strong> en espèces. Validez uniquement si vous avez bien reçu la somme.
                        </div>
                      )}

                      {/* Note conducteur */}
                      <div style={{ marginBottom:'0.8rem' }}>
                        <input type="text"
                          placeholder={`Message pour ${p.nomPayeur} (optionnel pour validation, obligatoire pour contestation)`}
                          value={noteValidation[p.id] || ''}
                          onChange={e => setNoteValidation({...noteValidation, [p.id]: e.target.value})}
                          style={{ width:'100%', padding:'0.65rem 0.9rem', border:'1px solid #D1D5DB', borderRadius:8, fontSize:'0.82rem', outline:'none', fontFamily:'system-ui,sans-serif', color:'#111827', boxSizing:'border-box' }} />
                      </div>

                      {/* Boutons P2P */}
                      <div style={{ display:'flex', gap:'0.6rem' }}>
                        <button onClick={() => handleValiderPaiement(p.id)}
                          style={{ flex:2, padding:'0.75rem', background:'linear-gradient(135deg,#00875A,#005C3E)', color:'white', border:'none', borderRadius:8, fontWeight:700, fontSize:'0.85rem', cursor:'pointer', fontFamily:'system-ui,sans-serif', display:'flex', alignItems:'center', justifyContent:'center', gap:'0.4rem', boxShadow:'0 2px 8px rgba(0,135,90,0.3)' }}
                          onMouseEnter={e => e.currentTarget.style.opacity='0.9'}
                          onMouseLeave={e => e.currentTarget.style.opacity='1'}>
                           J'ai bien reçu {p.montant} MAD
                        </button>
                        <button onClick={() => handleContesterPaiement(p.id)}
                          style={{ flex:1, padding:'0.75rem', background:'#FEE2E2', color:'#7F1D1D', border:'1px solid #FECACA', borderRadius:8, fontWeight:600, fontSize:'0.82rem', cursor:'pointer', fontFamily:'system-ui,sans-serif' }}
                          onMouseEnter={e => e.currentTarget.style.background='#FCA5A5'}
                          onMouseLeave={e => e.currentTarget.style.background='#FEE2E2'}>
                           Pas reçu
                        </button>
                      </div>
                    </div>
                  ))}
                </Card>
              )}

              <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'1rem' }}>
                {stats.map(({ val, label, suffix }) => (
                  <Card key={label}
                    style={{ padding:'1.5rem', textAlign:'center', transition:'transform 0.2s, box-shadow 0.2s' }}
                    onMouseEnter={e => { e.currentTarget.style.transform='translateY(-3px)'; e.currentTarget.style.boxShadow='0 8px 24px rgba(0,135,90,0.12)' }}
                    onMouseLeave={e => { e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.boxShadow='0 1px 3px rgba(0,0,0,0.04)' }}>
                    <div style={{ display:'inline-flex', alignItems:'center', justifyContent:'center', width:56, height:56, background:'#E8F5F0', borderRadius:14, marginBottom:'0.8rem' }}>
                      <span style={{ fontSize:'1.3rem', fontWeight:800, color:'#00875A', fontFamily:'system-ui,sans-serif' }}>
                        <AnimatedNumber value={val} suffix={suffix} />
                      </span>
                    </div>
                    <div style={{ fontSize:'0.8rem', color:'#374151', fontFamily:'system-ui,sans-serif', fontWeight:500 }}>{label}</div>
                  </Card>
                ))}
              </div>

              <Card>
                <div style={{ padding:'1rem 1.5rem', borderBottom:'1px solid #F3F4F6', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                  <span style={{ fontWeight:600, fontSize:'0.9rem', color:'#111827', fontFamily:'system-ui,sans-serif' }}>Mes derniers trajets</span>
                  <button onClick={() => setTab('Mes trajets')} style={{ color:'#00875A', fontSize:'0.82rem', background:'none', border:'none', cursor:'pointer', fontFamily:'system-ui,sans-serif', fontWeight:500 }}>Voir tout →</button>
                </div>
                {loading ? <div style={{ padding:'1rem' }}><Loading /></div> :
                  trajets.length === 0 ? (
                    <div style={{ padding:'2rem', textAlign:'center', color:'#6B7280', fontSize:'0.85rem', fontFamily:'system-ui,sans-serif' }}>
                      Aucun trajet publié.
                      <button onClick={() => setShowForm(true)} style={{ color:'#00875A', fontWeight:600, background:'none', border:'none', cursor:'pointer', marginLeft:6, fontFamily:'system-ui,sans-serif' }}>Publier</button>
                    </div>
                  ) : trajets.slice(0,3).map((t,i,arr) => (
                    <div key={t.id} style={{ padding:'1rem 1.5rem', borderBottom: i<arr.length-1 ? '1px solid #F9FAFB' : 'none', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                      <div>
                        <div style={{ fontWeight:600, color:'#111827', fontSize:'0.9rem', fontFamily:'system-ui,sans-serif' }}>{t.villeDepart} → {t.villeArrivee}</div>
                        <div style={{ fontSize:'0.75rem', color:'#6B7280', marginTop:2, fontFamily:'system-ui,sans-serif' }}>
                          {new Date(t.dateHeure).toLocaleDateString('fr-FR')} · {t.placesDisponibles} place(s)
                        </div>
                      </div>
                      <div style={{ display:'flex', alignItems:'center', gap:'0.8rem' }}>
                        <span style={{ fontWeight:700, color:'#111827', fontSize:'0.9rem', fontFamily:'system-ui,sans-serif' }}>{t.prixParPlace} MAD</span>
                        <Badge statut={t.statut} />
                      </div>
                    </div>
                  ))
                }
              </Card>

              <Card>
                <div style={{ padding:'1rem 1.5rem', borderBottom:'1px solid #F3F4F6', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                  <span style={{ fontWeight:600, fontSize:'0.9rem', color:'#111827', fontFamily:'system-ui,sans-serif' }}>Négociations en cours</span>
                  <button onClick={() => setTab('Négociations')} style={{ color:'#00875A', fontSize:'0.82rem', background:'none', border:'none', cursor:'pointer', fontFamily:'system-ui,sans-serif', fontWeight:500 }}>Voir tout →</button>
                </div>
                {loading ? <div style={{ padding:'1rem' }}><Loading /></div> :
                  negociations.filter(n=>n.statut==='EN_COURS').length === 0 ? (
                    <div style={{ padding:'2rem', textAlign:'center', color:'#6B7280', fontSize:'0.85rem', fontFamily:'system-ui,sans-serif' }}>Aucune négociation en cours.</div>
                  ) : negociations.filter(n=>n.statut==='EN_COURS').slice(0,2).map((n,i,arr) => (
                    <div key={n.id} style={{ padding:'1rem 1.5rem', borderBottom: i<arr.length-1 ? '1px solid #F9FAFB' : 'none', display:'flex', alignItems:'center', justifyContent:'space-between', gap:'0.5rem' }}>
                      <div>
                        <div style={{ fontWeight:600, color:'#111827', fontSize:'0.88rem', fontFamily:'system-ui,sans-serif' }}>{n.nomClient} · {n.villeDepart} → {n.villeArrivee}</div>
                        <div style={{ fontSize:'0.75rem', color:'#6B7280', marginTop:2, fontFamily:'system-ui,sans-serif' }}>Offre : {n.offreClient} MAD</div>
                      </div>
                      <div style={{ display:'flex', gap:'0.5rem' }}>
                        <button onClick={() => handleRepondre(n.id, 'ACCEPTE', null)}
                          style={{ background:'#E8F5F0', color:'#00875A', border:'none', borderRadius:6, padding:'0.35rem 0.8rem', fontSize:'0.78rem', fontWeight:600, cursor:'pointer', fontFamily:'system-ui,sans-serif' }}>Accepter</button>
                        <button onClick={() => handleRepondre(n.id, 'REFUSE', null)}
                          style={{ background:'#FEE2E2', color:'#7F1D1D', border:'none', borderRadius:6, padding:'0.35rem 0.8rem', fontSize:'0.78rem', fontWeight:600, cursor:'pointer', fontFamily:'system-ui,sans-serif' }}>Refuser</button>
                      </div>
                    </div>
                  ))
                }
              </Card>
            </div>
          )}

          {/* MES TRAJETS */}
          {tab === 'Mes trajets' && (
            <div style={{ display:'flex', flexDirection:'column', gap:'0.8rem' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'0.5rem' }}>
                <span style={{ fontWeight:600, fontSize:'0.95rem', color:'#111827', fontFamily:'system-ui,sans-serif' }}>
                  Mes trajets <span style={{ fontWeight:400, color:'#6B7280' }}>({trajets.length})</span>
                </span>
                <button onClick={() => setShowForm(true)} style={btnStyle()}
                  onMouseEnter={e => { e.currentTarget.style.background='#005C3E'; e.currentTarget.style.transform='translateY(-1px)' }}
                  onMouseLeave={e => { e.currentTarget.style.background='#00875A'; e.currentTarget.style.transform='translateY(0)' }}>
                  + Nouveau trajet
                </button>
              </div>
              {loading ? <Loading /> :
                trajets.length === 0 ? (
                  <Card style={{ padding:'3rem', textAlign:'center' }}>
                    <div style={{ fontWeight:500, color:'#374151', marginBottom:'1rem', fontFamily:'system-ui,sans-serif' }}>Aucun trajet publié</div>
                    <button onClick={() => setShowForm(true)} style={btnStyle()}>Publier un trajet</button>
                  </Card>
                ) : trajets.map(t => (
                  <Card key={t.id} style={{ padding:'1.1rem 1.5rem', display:'flex', alignItems:'center', justifyContent:'space-between', gap:'1rem', flexWrap:'wrap', transition:'box-shadow 0.2s' }}
                    onMouseEnter={e => e.currentTarget.style.boxShadow='0 4px 16px rgba(0,135,90,0.1)'}
                    onMouseLeave={e => e.currentTarget.style.boxShadow='0 1px 3px rgba(0,0,0,0.04)'}>
                    <div>
                      <div style={{ fontWeight:600, fontSize:'0.92rem', color:'#111827', fontFamily:'system-ui,sans-serif' }}>{t.villeDepart} → {t.villeArrivee}</div>
                      <div style={{ fontSize:'0.75rem', color:'#6B7280', marginTop:3, fontFamily:'system-ui,sans-serif' }}>
                        {new Date(t.dateHeure).toLocaleDateString('fr-FR')} à {new Date(t.dateHeure).toLocaleTimeString('fr-FR', {hour:'2-digit',minute:'2-digit'})} · {t.placesDisponibles} place(s)
                      </div>
                    </div>
                    <div style={{ display:'flex', alignItems:'center', gap:'0.8rem' }}>
                      <span style={{ fontWeight:700, color:'#111827', fontFamily:'system-ui,sans-serif' }}>{t.prixParPlace} MAD</span>
                      <Badge statut={t.statut} />
                    </div>
                  </Card>
                ))
              }
            </div>
          )}

          {/* NEGOCIATIONS */}
          {tab === 'Négociations' && (
            <div style={{ display:'flex', flexDirection:'column', gap:'0.8rem' }}>
              <span style={{ fontWeight:600, fontSize:'0.95rem', color:'#111827', fontFamily:'system-ui,sans-serif', marginBottom:'0.5rem', display:'block' }}>Négociations reçues</span>
              {loading ? <Loading /> :
                negociations.length === 0 ? (
                  <Card style={{ padding:'3rem', textAlign:'center' }}>
                    <div style={{ fontWeight:500, color:'#374151', fontFamily:'system-ui,sans-serif' }}>Aucune négociation</div>
                  </Card>
                ) : negociations.map(n => (
                  <Card key={n.id} style={{ padding:'1.2rem 1.5rem' }}>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1rem', flexWrap:'wrap', gap:'0.5rem' }}>
                      <div>
                        <div style={{ fontWeight:600, fontSize:'0.92rem', color:'#111827', fontFamily:'system-ui,sans-serif' }}>{n.nomClient}</div>
                        <div style={{ fontSize:'0.75rem', color:'#6B7280', marginTop:2, fontFamily:'system-ui,sans-serif' }}>{n.villeDepart} → {n.villeArrivee}</div>
                      </div>
                      <Badge statut={n.statut} />
                    </div>
                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem', marginBottom: n.statut==='EN_COURS' ? '1rem' : 0 }}>
                      <div style={{ background:'#E8F5F0', borderRadius:10, padding:'1rem', textAlign:'center', border:'1px solid #A7F3D0' }}>
                        <div style={{ fontSize:'0.7rem', color:'#00875A', marginBottom:4, fontFamily:'system-ui,sans-serif', fontWeight:600, textTransform:'uppercase' }}>Offre client</div>
                        <div style={{ fontSize:'1.5rem', fontWeight:800, color:'#005C3E', fontFamily:'system-ui,sans-serif' }}>{n.offreClient} MAD</div>
                      </div>
                      <div style={{ background:'#F9FAFB', borderRadius:10, padding:'1rem', textAlign:'center', border:'1px solid #E5E7EB' }}>
                        <div style={{ fontSize:'0.7rem', color:'#6B7280', marginBottom:4, fontFamily:'system-ui,sans-serif', fontWeight:600, textTransform:'uppercase' }}>Ma contre-offre</div>
                        <div style={{ fontSize:'1.5rem', fontWeight:800, color:'#111827', fontFamily:'system-ui,sans-serif' }}>{n.offreConducteur ? `${n.offreConducteur} MAD` : '—'}</div>
                      </div>
                    </div>
                    {n.statut === 'EN_COURS' && (
                      <div style={{ display:'flex', gap:'0.6rem', flexWrap:'wrap' }}>
                        <button onClick={() => handleRepondre(n.id, 'ACCEPTE', null)}
                          style={{ background:'#E8F5F0', color:'#00875A', border:'none', borderRadius:8, padding:'0.55rem 1.1rem', fontWeight:600, fontSize:'0.85rem', cursor:'pointer', fontFamily:'system-ui,sans-serif' }}>
                          Accepter {n.offreClient} MAD
                        </button>
                        <input type="number" placeholder="Contre-offre MAD" value={contre} onChange={e => setContre(e.target.value)}
                          style={{ flex:1, minWidth:120, padding:'0.55rem 0.9rem', border:'1px solid #D1D5DB', borderRadius:8, fontSize:'0.88rem', outline:'none', fontFamily:'system-ui,sans-serif', color:'#111827' }} />
                        <button onClick={() => { handleRepondre(n.id, 'CONTRE', parseFloat(contre)); setContre('') }}
                          style={{ background:'#111827', color:'white', border:'none', borderRadius:8, padding:'0.55rem 1.1rem', fontWeight:600, fontSize:'0.85rem', cursor:'pointer', fontFamily:'system-ui,sans-serif' }}>
                          Contre-proposer
                        </button>
                        <button onClick={() => handleRepondre(n.id, 'REFUSE', null)}
                          style={{ background:'#FEE2E2', color:'#7F1D1D', border:'none', borderRadius:8, padding:'0.55rem 1rem', fontWeight:600, fontSize:'0.85rem', cursor:'pointer', fontFamily:'system-ui,sans-serif' }}>
                          Refuser
                        </button>
                        <BtnChat onClick={() => setChatOuvert({ type:'RESERVATION', refId:n.trajetId, destinataireId:n.clientId, nomDestinataire:n.nomClient })} />
                      </div>
                    )}
                  </Card>
                ))
              }
            </div>
          )}

          {/* DOCUMENTS */}
          {tab === 'Documents' && (
            <div style={{ maxWidth:560 }}>
              <div style={{ fontWeight:600, fontSize:'0.95rem', color:'#111827', marginBottom:'1.2rem', fontFamily:'system-ui,sans-serif' }}>Soumettre mes documents</div>
              {docSuccess && <div style={{ background:'#E8F5F0', color:'#00875A', padding:'0.7rem 1rem', borderRadius:8, marginBottom:'1rem', fontSize:'0.83rem', fontFamily:'system-ui,sans-serif', border:'1px solid #A7F3D0' }}>{docSuccess}</div>}
              <Card style={{ padding:'1.5rem' }}>
                <div style={{ background:'#FFFBEB', border:'1px solid #FDE68A', borderRadius:8, padding:'0.8rem 1rem', marginBottom:'1.3rem', fontSize:'0.8rem', color:'#713F12', fontFamily:'system-ui,sans-serif' }}>
                  Photos JPG/PNG pour permis, CIN, véhicule et profil. PDF optionnel pour carte grise.
                </div>
                <div style={{ marginBottom:'1rem' }}>
                  <label style={labelStyle}>Marque et modèle *</label>
                  <input type="text" placeholder="Ex: Toyota Corolla 2020" value={docForm.marqueVoiture || ''} onChange={e => setDocForm({...docForm, marqueVoiture: e.target.value})} style={inputStyle} />
                </div>
                {[
                  ['permis', 'Permis de conduire *', 'image/*'],
                  ['cin', "Pièce d'identité (CIN) *", 'image/*'],
                  ['photoVoiture', 'Photo du véhicule *', 'image/*'],
                  ['photoProfile', 'Photo de profil *', 'image/*'],
                  ['carteGrise', 'Carte grise (optionnel)', '.pdf'],
                ].map(([key, label, accept]) => (
                  <div key={key} style={{ marginBottom:'1rem' }}>
                    <label style={labelStyle}>{label}</label>
                    <div onClick={() => document.getElementById(`file-${key}`).click()}
                      style={{ border:'1.5px dashed #D1D5DB', borderRadius:8, padding:'0.9rem', textAlign:'center', background:'#F9FAFB', cursor:'pointer', transition:'border-color 0.15s' }}
                      onMouseEnter={e => e.currentTarget.style.borderColor='#00875A'}
                      onMouseLeave={e => e.currentTarget.style.borderColor='#D1D5DB'}>
                      <input id={`file-${key}`} type="file" accept={accept} style={{ display:'none' }} onChange={e => setDocForm({...docForm, [key]: e.target.files[0]})} />
                      {docForm[key] ? (
                        <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:'0.7rem' }}>
                          {docForm[key].type?.startsWith('image/') && <img src={URL.createObjectURL(docForm[key])} alt="preview" style={{ width:44, height:44, objectFit:'cover', borderRadius:6 }} />}
                          <div>
                            <div style={{ fontSize:'0.83rem', fontWeight:600, color:'#111827', fontFamily:'system-ui,sans-serif' }}>{docForm[key].name}</div>
                            <div style={{ fontSize:'0.72rem', color:'#6B7280', fontFamily:'system-ui,sans-serif' }}>{(docForm[key].size/1024).toFixed(0)} KB</div>
                          </div>
                          <button onClick={e => { e.stopPropagation(); setDocForm({...docForm, [key]: null}) }}
                            style={{ background:'#FEE2E2', border:'none', color:'#7F1D1D', cursor:'pointer', fontSize:'0.75rem', fontWeight:600, padding:'0.2rem 0.5rem', borderRadius:4, fontFamily:'system-ui,sans-serif' }}>
                            Supprimer
                          </button>
                        </div>
                      ) : (
                        <div>
                          <div style={{ color:'#6B7280', fontSize:'0.8rem', fontFamily:'system-ui,sans-serif' }}>Cliquer pour sélectionner</div>
                          <div style={{ color:'#00875A', fontSize:'0.75rem', fontWeight:500, marginTop:2, fontFamily:'system-ui,sans-serif' }}>{accept === '.pdf' ? 'PDF' : 'JPG ou PNG'}</div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                <button onClick={handleSoumettreDocuments} disabled={docLoading}
                  style={{ ...btnStyle(docLoading ? '#9CA3AF' : '#00875A'), width:'100%', justifyContent:'center', marginTop:'0.5rem', cursor: docLoading ? 'not-allowed' : 'pointer' }}>
                  {docLoading ? 'Envoi en cours...' : 'Soumettre mes documents'}
                </button>
              </Card>
            </div>
          )}

          {/* MES LIVRAISONS */}
          {tab === 'Mes livraisons' && (
            <div style={{ display:'flex', flexDirection:'column', gap:'1.5rem' }}>
              {livraisonSuccess && <div style={{ background:'#E8F5F0', color:'#00875A', padding:'0.7rem 1rem', borderRadius:8, fontSize:'0.83rem', fontFamily:'system-ui,sans-serif', border:'1px solid #A7F3D0' }}>{livraisonSuccess}</div>}

              <div>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'0.8rem' }}>
                  <span style={{ fontWeight:600, fontSize:'0.95rem', color:'#111827', fontFamily:'system-ui,sans-serif' }}>
                    Mes offres <span style={{ fontWeight:400, color:'#6B7280' }}>({offresLivraison.length})</span>
                  </span>
                  <button onClick={() => estVerifie ? setShowOffreForm(true) : null} style={btnStyle('#C2410C')}
                    onMouseEnter={e => { e.currentTarget.style.background='#9A3412'; e.currentTarget.style.transform='translateY(-1px)' }}
                    onMouseLeave={e => { e.currentTarget.style.background='#C2410C'; e.currentTarget.style.transform='translateY(0)' }}>
                    + Nouvelle offre
                  </button>
                </div>
                {offresLivraison.length === 0 ? (
                  <Card style={{ padding:'1.5rem', textAlign:'center' }}>
                    <div style={{ color:'#6B7280', fontSize:'0.85rem', fontFamily:'system-ui,sans-serif', marginBottom:'0.8rem' }}>Aucune offre publiée.</div>
                    <button onClick={() => setShowOffreForm(true)} style={btnStyle('#C2410C')}>+ Publier une offre</button>
                  </Card>
                ) : offresLivraison.map(o => (
                  <Card key={o.id} style={{ padding:'1rem 1.5rem', marginBottom:'0.6rem', display:'flex', alignItems:'center', justifyContent:'space-between', transition:'box-shadow 0.2s' }}
                    onMouseEnter={e => e.currentTarget.style.boxShadow='0 4px 12px rgba(0,0,0,0.08)'}
                    onMouseLeave={e => e.currentTarget.style.boxShadow='0 1px 3px rgba(0,0,0,0.04)'}>
                    <div>
                      <div style={{ fontWeight:600, fontSize:'0.9rem', color:'#111827', fontFamily:'system-ui,sans-serif' }}>{o.villeDepart} → {o.villeArrivee}</div>
                      <div style={{ fontSize:'0.75rem', color:'#6B7280', marginTop:2, fontFamily:'system-ui,sans-serif' }}>
                        {o.prixParKg} MAD/kg · Max : <strong style={{ color:'#00875A' }}>{o.poidsRestant ?? o.poidsMax} kg</strong>
                        {o.description ? ` · ${o.description}` : ''}
                      </div>
                    </div>
                    <div style={{ display:'flex', alignItems:'center', gap:'0.8rem' }}>
                      <Badge statut={o.statut} />
                      {o.statut === 'ACTIF' && (
                        <button onClick={() => handleDesactiverOffre(o.id)}
                          style={{ background:'#FEE2E2', color:'#7F1D1D', border:'1px solid #FECACA', borderRadius:6, padding:'0.35rem 0.8rem', fontSize:'0.75rem', fontWeight:600, cursor:'pointer', fontFamily:'system-ui,sans-serif' }}
                          onMouseEnter={e => { e.currentTarget.style.background='#FCA5A5'; e.currentTarget.style.transform='translateY(-1px)' }}
                          onMouseLeave={e => { e.currentTarget.style.background='#FEE2E2'; e.currentTarget.style.transform='translateY(0)' }}>
                          Désactiver
                        </button>
                      )}
                    </div>
                  </Card>
                ))}
              </div>

              <div>
                <div style={{ fontWeight:600, fontSize:'0.95rem', color:'#111827', marginBottom:'0.8rem', fontFamily:'system-ui,sans-serif' }}>
                  Demandes clients <span style={{ fontWeight:400, color:'#6B7280' }}>({colisATraiter.length})</span>
                </div>
                {colisATraiter.length === 0 ? (
                  <Card style={{ padding:'1.5rem', textAlign:'center' }}>
                    <div style={{ color:'#6B7280', fontSize:'0.85rem', fontFamily:'system-ui,sans-serif' }}>Aucune demande.</div>
                  </Card>
                ) : colisATraiter.map(c => (
                  <Card key={c.id} style={{ padding:'1.2rem 1.5rem', marginBottom:'0.8rem', border: c.statut === 'CONTRE_OFFRE_CLIENT' ? '2px solid #FDE68A' : '1px solid #E5E7EB' }}>
                    <div style={{ display:'flex', justifyContent:'space-between', flexWrap:'wrap', gap:'0.5rem', marginBottom:'0.9rem' }}>
                      <div>
                        <div style={{ fontWeight:600, fontSize:'0.9rem', color:'#111827', fontFamily:'system-ui,sans-serif' }}>{c.villeDepart} → {c.villeArrivee}</div>
                        <div style={{ fontSize:'0.75rem', color:'#6B7280', marginTop:2, fontFamily:'system-ui,sans-serif' }}>
                          {c.description} · {c.poids} kg · Expéditeur : <strong style={{ color:'#111827' }}>{c.nomExpediteur}</strong>
                        </div>
                        <div style={{ fontSize:'0.75rem', color:'#374151', marginTop:1, fontFamily:'system-ui,sans-serif' }}>
                          Destinataire : {c.nomDestinataire} ({c.telephoneDestinataire})
                        </div>
                      </div>
                      <div style={{ display:'flex', gap:'0.8rem', alignItems:'center' }}>
                        {c.statut !== 'LIVRE' && (
                          <BtnChat onClick={() => setChatOuvert({ type:'COLIS', refId:c.id, destinataireId:c.expediteurId, nomDestinataire:c.nomExpediteur })} />
                        )}
                        <Badge statut={c.statut} />
                      </div>
                    </div>
                    {c.statut === 'CONTRE_OFFRE_CLIENT' && (
                      <div style={{ background:'#FEF9C3', borderRadius:8, padding:'0.8rem 1rem', marginBottom:'0.8rem', border:'1px solid #FDE68A' }}>
                        <div style={{ fontSize:'0.72rem', color:'#713F12', fontFamily:'system-ui,sans-serif', fontWeight:600, textTransform:'uppercase', marginBottom:2 }}>Le client contre-propose :</div>
                        <div style={{ fontSize:'1.4rem', fontWeight:800, color:'#713F12', fontFamily:'system-ui,sans-serif' }}>{c.prix} MAD</div>
                      </div>
                    )}
                    <div style={{ background:'#F9FAFB', borderRadius:8, padding:'0.9rem', border:'1px solid #E5E7EB' }}>
                      <div style={{ fontSize:'0.75rem', color:'#374151', fontWeight:600, marginBottom:'0.6rem', fontFamily:'system-ui,sans-serif' }}>
                        {c.statut === 'CONTRE_OFFRE_CLIENT' ? 'Votre réponse :' : 'Proposer un prix :'}
                      </div>
                      <div style={{ display:'flex', gap:'0.6rem', flexWrap:'wrap', alignItems:'center' }}>
                        {c.statut === 'CONTRE_OFFRE_CLIENT' && (
                          <button onClick={() => handleAccepterContreOffre(c.id, c.prix)}
                            style={{ ...btnStyle(), padding:'0.55rem 1.1rem' }}
                            onMouseEnter={e => { e.currentTarget.style.background='#005C3E'; e.currentTarget.style.transform='translateY(-1px)' }}
                            onMouseLeave={e => { e.currentTarget.style.background='#00875A'; e.currentTarget.style.transform='translateY(0)' }}>
                            Accepter {c.prix} MAD
                          </button>
                        )}
                        <div style={{ display:'flex', gap:'0.5rem', flex:1, minWidth:200 }}>
                          <input type="number"
                            placeholder={c.statut === 'CONTRE_OFFRE_CLIENT' ? 'Nouveau prix MAD' : 'Prix en MAD'}
                            value={prixSaisie[c.id] || ''}
                            onChange={e => setPrixSaisie({...prixSaisie, [c.id]: e.target.value})}
                            style={{ flex:1, padding:'0.6rem 0.8rem', border:'1px solid #D1D5DB', borderRadius:6, fontSize:'0.88rem', outline:'none', fontFamily:'system-ui,sans-serif', color:'#111827' }} />
                          <button onClick={() => handleProposerPrix(c.id)}
                            style={{ background:'#111827', color:'white', border:'none', borderRadius:6, padding:'0.6rem 1rem', fontWeight:600, fontSize:'0.82rem', cursor:'pointer', fontFamily:'system-ui,sans-serif', whiteSpace:'nowrap' }}
                            onMouseEnter={e => { e.currentTarget.style.background='#374151'; e.currentTarget.style.transform='translateY(-1px)' }}
                            onMouseLeave={e => { e.currentTarget.style.background='#111827'; e.currentTarget.style.transform='translateY(0)' }}>
                            {c.statut === 'CONTRE_OFFRE_CLIENT' ? 'Contre-proposer' : 'Proposer'}
                          </button>
                        </div>
                        <button onClick={() => handleRefuserPrix(c.id)}
                          style={{ background:'#FEE2E2', color:'#7F1D1D', border:'none', borderRadius:6, padding:'0.6rem 0.9rem', fontWeight:600, fontSize:'0.82rem', cursor:'pointer', fontFamily:'system-ui,sans-serif' }}
                          onMouseEnter={e => e.currentTarget.style.background='#FCA5A5'}
                          onMouseLeave={e => e.currentTarget.style.background='#FEE2E2'}>
                          Refuser
                        </button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              <div>
                <div style={{ fontWeight:600, fontSize:'0.95rem', color:'#111827', marginBottom:'0.8rem', fontFamily:'system-ui,sans-serif' }}>
                  Colis acceptés — à démarrer <span style={{ fontWeight:400, color:'#6B7280' }}>({mesLivraisons.filter(l=>l.statut==='ACCEPTE').length})</span>
                </div>
                {mesLivraisons.filter(l=>l.statut==='ACCEPTE').length === 0 ? (
                  <Card style={{ padding:'1.5rem', textAlign:'center' }}>
                    <div style={{ color:'#6B7280', fontSize:'0.85rem', fontFamily:'system-ui,sans-serif' }}>Aucun colis accepté.</div>
                  </Card>
                ) : mesLivraisons.filter(l=>l.statut==='ACCEPTE').map(c => (
                  <Card key={c.id} style={{ padding:'1.2rem 1.5rem', marginBottom:'0.8rem', display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:'0.8rem' }}>
                    <div>
                      <div style={{ fontWeight:600, fontSize:'0.9rem', color:'#111827', fontFamily:'system-ui,sans-serif' }}>{c.villeDepart} → {c.villeArrivee}</div>
                      <div style={{ fontSize:'0.75rem', color:'#6B7280', marginTop:2, fontFamily:'system-ui,sans-serif' }}>
                        {c.description} · {c.poids} kg · Prix : <strong style={{ color:'#00875A' }}>{c.prix} MAD</strong>
                      </div>
                    </div>
                    <div style={{ display:'flex', gap:'0.8rem', alignItems:'center' }}>
                      <BtnChat onClick={() => setChatOuvert({ type:'COLIS', refId:c.id, destinataireId:c.expediteurId, nomDestinataire:c.nomExpediteur })} />
                      <button onClick={() => handleDemarrer(c.id)} style={btnStyle('#1E3A8A')}
                        onMouseEnter={e => { e.currentTarget.style.background='#1e40af'; e.currentTarget.style.transform='translateY(-1px)' }}
                        onMouseLeave={e => { e.currentTarget.style.background='#1E3A8A'; e.currentTarget.style.transform='translateY(0)' }}>
                        Démarrer la livraison
                      </button>
                    </div>
                  </Card>
                ))}
              </div>

              <div>
                <div style={{ fontWeight:600, fontSize:'0.95rem', color:'#111827', marginBottom:'0.8rem', fontFamily:'system-ui,sans-serif' }}>
                  En transit — saisir OTP <span style={{ fontWeight:400, color:'#6B7280' }}>({mesLivraisons.filter(l=>l.statut==='EN_TRANSIT').length})</span>
                </div>
                {mesLivraisons.filter(l=>l.statut==='EN_TRANSIT').length === 0 ? (
                  <Card style={{ padding:'1.5rem', textAlign:'center' }}>
                    <div style={{ color:'#6B7280', fontSize:'0.85rem', fontFamily:'system-ui,sans-serif' }}>Aucune livraison en transit.</div>
                  </Card>
                ) : mesLivraisons.filter(l=>l.statut==='EN_TRANSIT').map(c => (
                  <Card key={c.id} style={{ padding:'1.2rem 1.5rem', marginBottom:'0.8rem' }}>
                    <div style={{ display:'flex', justifyContent:'space-between', flexWrap:'wrap', gap:'0.5rem', marginBottom:'1rem' }}>
                      <div>
                        <div style={{ fontWeight:600, fontSize:'0.9rem', color:'#111827', fontFamily:'system-ui,sans-serif' }}>{c.villeDepart} → {c.villeArrivee}</div>
                        <div style={{ fontSize:'0.75rem', color:'#6B7280', marginTop:2, fontFamily:'system-ui,sans-serif' }}>
                          {c.description} · Destinataire : {c.nomDestinataire} ({c.telephoneDestinataire})
                        </div>
                      </div>
                      <div style={{ display:'flex', gap:'0.8rem', alignItems:'center' }}>
                        <BtnChat onClick={() => setChatOuvert({ type:'COLIS', refId:c.id, destinataireId:c.expediteurId, nomDestinataire:c.nomExpediteur })} />
                        <Badge statut={c.statut} />
                      </div>
                    </div>
                    <div style={{ marginBottom:'1rem' }}>
                      <MapSuivi colisId={c.id} mode="conducteur" nomDestinataire={c.nomDestinataire} getToken={() => localStorage.getItem('token')} />
                    </div>
                    <div style={{ background:'#F9FAFB', borderRadius:8, padding:'0.9rem', border:'1px solid #E5E7EB' }}>
                      <div style={{ fontSize:'0.75rem', color:'#374151', fontWeight:600, marginBottom:'0.6rem', fontFamily:'system-ui,sans-serif' }}>
                        Code OTP communiqué par le destinataire :
                      </div>
                      <div style={{ display:'flex', gap:'0.6rem' }}>
                        <input type="text" placeholder="Code OTP" maxLength={6}
                          value={otpSaisie[c.id] || ''}
                          onChange={e => setOtpSaisie({...otpSaisie, [c.id]: e.target.value.replace(/\D/g,'')})}
                          style={{ flex:1, padding:'0.6rem', border:'1px solid #D1D5DB', borderRadius:6, fontSize:'1.2rem', outline:'none', fontFamily:'monospace', textAlign:'center', letterSpacing:8, color:'#111827' }} />
                        <button onClick={() => handleValiderOTP(c.id)} style={btnStyle()}>Confirmer</button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              {mesLivraisons.filter(l=>l.statut==='LIVRE').length > 0 && (
                <div>
                  <div style={{ fontWeight:600, fontSize:'0.95rem', color:'#111827', marginBottom:'0.8rem', fontFamily:'system-ui,sans-serif' }}>
                    Livraisons terminées <span style={{ fontWeight:400, color:'#6B7280' }}>({mesLivraisons.filter(l=>l.statut==='LIVRE').length})</span>
                  </div>
                  {mesLivraisons.filter(l=>l.statut==='LIVRE').map(c => (
                    <Card key={c.id} style={{ padding:'1rem 1.5rem', marginBottom:'0.6rem', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                      <div>
                        <div style={{ fontWeight:600, fontSize:'0.88rem', color:'#111827', fontFamily:'system-ui,sans-serif' }}>{c.villeDepart} → {c.villeArrivee}</div>
                        <div style={{ fontSize:'0.73rem', color:'#6B7280', marginTop:2, fontFamily:'system-ui,sans-serif' }}>{c.description} · {c.nomDestinataire} · {c.prix} MAD</div>
                      </div>
                      <Badge statut={c.statut} />
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* MESSAGES */}
          {tab === 'Messages' && (
            <div style={{ maxWidth:680 }}>
              <div style={{ fontWeight:600, fontSize:'0.95rem', color:'#111827', marginBottom:'1.2rem', fontFamily:'system-ui,sans-serif', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                <span>Messages {totalNonLus > 0 && <span style={{ background:'#EF4444', color:'white', borderRadius:50, fontSize:'0.65rem', fontWeight:700, padding:'0.1rem 0.45rem', marginLeft:'0.4rem' }}>{totalNonLus}</span>}</span>
                <button onClick={chargerConversations}
                  style={{ background:'none', border:'1px solid #E5E7EB', color:'#374151', cursor:'pointer', fontSize:'0.82rem', fontFamily:'system-ui,sans-serif', fontWeight:500, borderRadius:8, padding:'0.4rem 0.9rem', display:'inline-flex', alignItems:'center', gap:'0.3rem' }}>
                  ↻ Actualiser
                </button>
              </div>
              {convLoading ? <Loading /> :
                conversations.length === 0 ? (
                  <Card style={{ padding:'3rem', textAlign:'center' }}>
                    <div style={{ fontSize:'3rem', marginBottom:'0.8rem' }}>💬</div>
                    <div style={{ fontWeight:600, color:'#374151', fontFamily:'system-ui,sans-serif', marginBottom:'0.4rem' }}>Aucune conversation</div>
                    <div style={{ fontSize:'0.8rem', color:'#9CA3AF', fontFamily:'system-ui,sans-serif' }}>Les conversations apparaîtront ici quand un client vous envoie un message</div>
                  </Card>
                ) : (
                  <div style={{ display:'flex', flexDirection:'column', gap:'0.4rem' }}>
                    {conversations.map(conv => (
                      <div key={`${conv.typeConversation}-${conv.referenceId}`}
                        onClick={() => setChatOuvert({ type:conv.typeConversation, refId:conv.referenceId, destinataireId:conv.interlocuteurId, nomDestinataire:conv.nomInterlocuteur })}
                        style={{ background: conv.nonLus > 0 ? '#F0F7FF' : 'white', borderRadius:12, border: conv.nonLus > 0 ? '1.5px solid #BFDBFE' : '1px solid #E5E7EB', padding:'1rem 1.2rem', display:'flex', alignItems:'center', gap:'1rem', cursor:'pointer', transition:'all 0.15s', boxShadow: conv.nonLus > 0 ? '0 2px 8px rgba(59,130,246,0.12)' : '0 1px 3px rgba(0,0,0,0.04)' }}
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
            <div style={{ maxWidth:600 }}>
              <div style={{ fontWeight:600, fontSize:'0.95rem', color:'#111827', marginBottom:'1.2rem', fontFamily:'system-ui,sans-serif' }}>Mon profil</div>
              <Card style={{ padding:'1.5rem', marginBottom:'1rem' }}>
                <div style={{ display:'flex', alignItems:'center', gap:'1rem', marginBottom:'1.5rem', paddingBottom:'1.5rem', borderBottom:'1px solid #F3F4F6' }}>
                  <div style={{ width:72, height:72, borderRadius:'50%', overflow:'hidden', flexShrink:0, border:'2px solid #E8F5F0', boxShadow:'0 0 0 3px rgba(0,135,90,0.15)' }}>
                    {conducteurInfo?.photoProfile ? (
                      <img src={`http://localhost:8080/api/documents/fichier/${conducteurInfo.photoProfile}`}
                        alt={user?.nom} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                    ) : (
                      <div style={{ width:'100%', height:'100%', background:'#00875A', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, fontSize:'1.3rem', color:'white', fontFamily:'system-ui,sans-serif' }}>
                        {user?.nom?.split(' ').map(n=>n[0]).join('').toUpperCase().slice(0,2) || 'C'}
                      </div>
                    )}
                  </div>
                  <div>
                    <div style={{ fontWeight:700, fontSize:'1.1rem', color:'#111827', fontFamily:'system-ui,sans-serif' }}>{user?.nom}</div>
                    <div style={{ fontSize:'0.78rem', color:'#6B7280', marginTop:2, fontFamily:'system-ui,sans-serif' }}>{user?.email}</div>
                    {conducteurInfo?.marqueVoiture && (
                      <div style={{ fontSize:'0.78rem', color:'#374151', marginTop:2, fontFamily:'system-ui,sans-serif' }}>🚗 {conducteurInfo.marqueVoiture}</div>
                    )}
                    <div style={{ display:'inline-flex', alignItems:'center', gap:'0.4rem', background: estVerifie ? '#E8F5F0' : '#FEF9C3', color: estVerifie ? '#00875A' : '#713F12', padding:'0.2rem 0.7rem', borderRadius:50, fontSize:'0.72rem', fontWeight:600, marginTop:6, fontFamily:'system-ui,sans-serif' }}>
                      <span style={{ width:5, height:5, background: estVerifie ? '#00875A' : '#F59E0B', borderRadius:'50%' }} />
                      {estVerifie ? 'Conducteur vérifié' : (conducteurInfo?.statutVerification || 'En attente de validation')}
                    </div>
                  </div>
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.9rem' }}>
                  {[['Nom complet', user?.nom],['Email', user?.email]].map(([label, value]) => (
                    <div key={label}>
                      <label style={labelStyle}>{label}</label>
                      <div style={{ padding:'0.7rem 0.9rem', background:'#F9FAFB', border:'1px solid #E5E7EB', borderRadius:8, fontSize:'0.88rem', color:'#111827', fontFamily:'system-ui,sans-serif' }}>
                        {value || '—'}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* COORDONNÉES BANCAIRES */}
              <Card style={{ padding:'1.5rem', marginBottom:'1rem' }}>
                <div style={{ fontWeight:600, fontSize:'0.9rem', color:'#111827', marginBottom:'0.4rem', fontFamily:'system-ui,sans-serif', display:'flex', alignItems:'center', gap:'0.5rem' }}>
                   Mes coordonnées bancaires
                </div>
                <div style={{ fontSize:'0.75rem', color:'#6B7280', fontFamily:'system-ui,sans-serif', marginBottom:'1.2rem' }}>
                  Ces informations permettent aux clients de vous payer par virement. Vérifiez-les soigneusement.
                </div>
                <InfosBancairesForm conducteurId={user?.id} authHeader={authHeader} />
              </Card>

              <Card style={{ padding:'1.5rem' }}>
                <div style={{ fontWeight:600, fontSize:'0.9rem', color:'#111827', marginBottom:'1.2rem', fontFamily:'system-ui,sans-serif', display:'flex', alignItems:'center', gap:'0.5rem' }}>
                  Documents soumis
                  {conducteurInfo?.statutVerification && (
                    <span style={{ background: conducteurInfo.statutVerification === 'VALIDE' ? '#E8F5F0' : conducteurInfo.statutVerification === 'REJETE' ? '#FEE2E2' : '#FEF9C3', color: conducteurInfo.statutVerification === 'VALIDE' ? '#00875A' : conducteurInfo.statutVerification === 'REJETE' ? '#7F1D1D' : '#713F12', padding:'0.15rem 0.6rem', borderRadius:20, fontSize:'0.7rem', fontWeight:600, fontFamily:'system-ui,sans-serif' }}>
                      {conducteurInfo.statutVerification}
                    </span>
                  )}
                </div>
                {!conducteurInfo?.permisConduire && !conducteurInfo?.pieceIdentite && !conducteurInfo?.photoVoiture ? (
                  <div style={{ textAlign:'center', padding:'1.5rem 0', color:'#6B7280', fontSize:'0.85rem', fontFamily:'system-ui,sans-serif' }}>
                    <div style={{ fontSize:'2rem', marginBottom:'0.5rem' }}>📄</div>
                    Aucun document soumis.
                    <br />
                    <button onClick={() => setTab('Documents')} style={{ color:'#00875A', fontWeight:600, background:'none', border:'none', cursor:'pointer', marginTop:6, fontFamily:'system-ui,sans-serif', fontSize:'0.85rem' }}>
                      Soumettre mes documents →
                    </button>
                  </div>
                ) : (
                  <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(160px,1fr))', gap:'0.9rem' }}>
                    {[[conducteurInfo?.photoProfile,'Photo de profil'],[conducteurInfo?.permisConduire,'Permis de conduire'],[conducteurInfo?.pieceIdentite,'CIN'],[conducteurInfo?.photoVoiture,'Photo véhicule']].map(([fichier, label]) => fichier ? (
                      <div key={label} style={{ borderRadius:10, overflow:'hidden', border:'1px solid #E5E7EB' }}>
                        <div style={{ background:'#F9FAFB', padding:'0.35rem 0.7rem', borderBottom:'1px solid #E5E7EB' }}>
                          <span style={{ fontSize:'0.7rem', fontWeight:600, color:'#374151', textTransform:'uppercase', fontFamily:'system-ui,sans-serif' }}>{label}</span>
                        </div>
                        <a href={`http://localhost:8080/api/documents/fichier/${fichier}`} target="_blank" rel="noreferrer">
                          <img src={`http://localhost:8080/api/documents/fichier/${fichier}`} alt={label} style={{ width:'100%', height:110, objectFit:'cover', display:'block' }} onError={e => e.target.style.display='none'} />
                        </a>
                      </div>
                    ) : null)}
                    {conducteurInfo?.carteGrise && (
                      <div style={{ borderRadius:10, overflow:'hidden', border:'1px solid #E5E7EB' }}>
                        <div style={{ background:'#F9FAFB', padding:'0.35rem 0.7rem', borderBottom:'1px solid #E5E7EB' }}>
                          <span style={{ fontSize:'0.7rem', fontWeight:600, color:'#374151', textTransform:'uppercase', fontFamily:'system-ui,sans-serif' }}>Carte grise</span>
                        </div>
                        <a href={`http://localhost:8080/api/documents/fichier/${conducteurInfo.carteGrise}`} target="_blank" rel="noreferrer"
                          style={{ display:'flex', height:110, alignItems:'center', justifyContent:'center', background:'#F9FAFB', flexDirection:'column', gap:'0.4rem', textDecoration:'none' }}>
                          <span style={{ fontSize:'1.8rem' }}>📄</span>
                          <span style={{ fontSize:'0.75rem', color:'#374151', fontFamily:'system-ui,sans-serif' }}>Voir le PDF</span>
                        </a>
                      </div>
                    )}
                    {conducteurInfo?.marqueVoiture && (
                      <div style={{ borderRadius:10, border:'1px solid #E5E7EB', padding:'1rem', display:'flex', flexDirection:'column', justifyContent:'center', alignItems:'center', background:'#F9FAFB' }}>
                        <div style={{ fontSize:'1.5rem', marginBottom:'0.3rem' }}>🚗</div>
                        <div style={{ fontSize:'0.72rem', fontWeight:600, color:'#374151', textTransform:'uppercase', fontFamily:'system-ui,sans-serif', marginBottom:4 }}>Véhicule</div>
                        <div style={{ fontSize:'0.85rem', fontWeight:600, color:'#111827', fontFamily:'system-ui,sans-serif', textAlign:'center' }}>{conducteurInfo.marqueVoiture}</div>
                      </div>
                    )}
                  </div>
                )}
                <button onClick={() => setTab('Documents')}
                  style={{ ...btnStyle(), marginTop:'1.2rem', width:'100%', justifyContent:'center' }}
                  onMouseEnter={e => { e.currentTarget.style.background='#005C3E'; e.currentTarget.style.transform='translateY(-1px)' }}
                  onMouseLeave={e => { e.currentTarget.style.background='#00875A'; e.currentTarget.style.transform='translateY(0)' }}>
                  {conducteurInfo?.permisConduire ? 'Mettre à jour mes documents' : 'Soumettre mes documents'}
                </button>
              </Card>
            </div>
          )}

        </div>
      </div>

      {chatOuvert && (
        <Chat type={chatOuvert.type} refId={chatOuvert.refId} destinataireId={chatOuvert.destinataireId} nomDestinataire={chatOuvert.nomDestinataire} onClose={fermerChat} />
      )}

      <Footer />
    </>
  )
}