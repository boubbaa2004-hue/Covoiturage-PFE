import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../../components/layout/Header'
import Footer from '../../components/layout/Footer'
import {
  creerColis, getMesColis, suivreColisOTP,
  isAuthenticated, getUser, getToken
} from '../../lib/api'

function Badge({ statut }) {
  const colors = {
    'EN_ATTENTE':         { bg:'#FEF9C3', color:'#713F12' },
    'PRIX_PROPOSE':       { bg:'#FEF9C3', color:'#713F12' },
    'CONTRE_OFFRE_CLIENT':{ bg:'#EDE9FE', color:'#4C1D95' },
    'ACCEPTE':            { bg:'#E8F5F0', color:'#00875A' },
    'EN_TRANSIT':         { bg:'#DBEAFE', color:'#1E3A8A' },
    'LIVRE':              { bg:'#DCFCE7', color:'#14532D' },
    'ANNULE':             { bg:'#FEE2E2', color:'#7F1D1D' },
  }
  const s = colors[statut] || { bg:'#F3F4F6', color:'#374151' }
  return (
    <span style={{ ...s, padding:'0.2rem 0.7rem', borderRadius:4, fontSize:'0.72rem', fontWeight:600, fontFamily:'system-ui,sans-serif' }}>
      {statut?.replace(/_/g,' ')}
    </span>
  )
}

function Card({ children, style }) {
  return <div style={{ background:'white', borderRadius:12, border:'1px solid #E5E7EB', ...style }}>{children}</div>
}

// ✅ Tabs : Offres conducteurs + Envoyer + Suivre + Mes envois
const TABS_CONNECTE  = ['Offres conducteurs', 'Envoyer un colis', 'Suivre un colis', 'Mes envois']
const TABS_VISITEUR  = ['Offres conducteurs', 'Suivre un colis']

const emptyForm = {
  description:'', poids:'', villeDepart:'', villeArrivee:'',
  nomDestinataire:'', telephoneDestinataire:''
}

const labelStyle = { fontSize:'0.72rem', fontWeight:600, color:'#374151', textTransform:'uppercase', letterSpacing:'0.4px', display:'block', marginBottom:'0.35rem', fontFamily:'system-ui,sans-serif' }
const inputStyle = { width:'100%', padding:'0.75rem 0.9rem', border:'1px solid #D1D5DB', borderRadius:6, fontSize:'0.88rem', outline:'none', fontFamily:'system-ui,sans-serif', color:'#111827', background:'white' }

export default function LivraisonPage() {
  const navigate = useNavigate()
  const user = getUser()
  const connecte = isAuthenticated()
  const TABS = connecte ? TABS_CONNECTE : TABS_VISITEUR

  const [tab, setTab] = useState('Offres conducteurs')
  const [step, setStep] = useState(1)
  const [form, setForm] = useState(emptyForm)
  const [colis, setColis] = useState([])
  const [colisCreé, setColisCreé] = useState(null)
  const [otpInput, setOtpInput] = useState('')
  const [otpResult, setOtpResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [colisLoading, setColisLoading] = useState(false)
  const [error, setError] = useState('')
  const [otpError, setOtpError] = useState('')

  // ✅ Offres conducteurs
  const [offres, setOffres] = useState([])
  const [offresLoading, setOffresLoading] = useState(true)
  const [searchOffre, setSearchOffre] = useState({ depart:'', arrivee:'' })
  const [selectedOffre, setSelectedOffre] = useState(null)
  const [colisOffreForm, setColisOffreForm] = useState(emptyForm)
  const [colisOffreLoading, setColisOffreLoading] = useState(false)
  const [colisOffreError, setColisOffreError] = useState('')

  useEffect(() => {
    chargerOffres()
    if (connecte && tab === 'Mes envois') chargerColis()
  }, [tab])

  const chargerOffres = async () => {
    setOffresLoading(true)
    try {
      const res = await fetch('http://localhost:8080/api/offres-livraison/disponibles')
      if (res.ok) setOffres(await res.json())
    } catch (e) {}
    finally { setOffresLoading(false) }
  }

  const chargerColis = async () => {
    setColisLoading(true)
    try {
      const data = await getMesColis()
      setColis(Array.isArray(data) ? data : [])
    } catch (e) { setError('Erreur de chargement') }
    finally { setColisLoading(false) }
  }

  // ✅ Envoyer colis via offre conducteur
  const handleEnvoyerColisOffre = async () => {
    if (!connecte) { navigate('/auth/login'); return }
    if (!colisOffreForm.description || !colisOffreForm.poids || !colisOffreForm.nomDestinataire || !colisOffreForm.telephoneDestinataire) {
      setColisOffreError('Veuillez remplir tous les champs'); return
    }
    setColisOffreLoading(true)
    setColisOffreError('')
    try {
      const res = await fetch('http://localhost:8080/api/colis', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${getToken()}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...colisOffreForm,
          poids: parseFloat(colisOffreForm.poids),
          offreLivraisonId: selectedOffre?.id
        })
      })
      if (!res.ok) throw new Error()
      navigate('/dashboard/client?tab=colis')
    } catch (e) { setColisOffreError('Erreur lors de la soumission') }
    finally { setColisOffreLoading(false) }
  }

  // ✅ Envoyer colis sans offre (formulaire libre)
  const handleEnvoyer = async () => {
    if (!connecte) { navigate('/auth/login'); return }
    if (!form.description || !form.poids || !form.villeDepart || !form.villeArrivee || !form.nomDestinataire || !form.telephoneDestinataire) {
      setError('Veuillez remplir tous les champs obligatoires'); return
    }
    setLoading(true)
    setError('')
    try {
      const data = await creerColis({ ...form, poids: parseFloat(form.poids) })
      setColisCreé(data)
      setStep(3)
    } catch (e) { setError("Erreur lors de l'envoi du colis") }
    finally { setLoading(false) }
  }

  const handleSuivi = async () => {
    if (!otpInput || otpInput.length !== 6) { setOtpError('Entrez un code OTP de 6 chiffres'); return }
    setOtpError('')
    setLoading(true)
    try {
      const data = await suivreColisOTP(otpInput)
      setOtpResult(data)
    } catch (e) { setOtpResult('non trouvé') }
    finally { setLoading(false) }
  }

  // ✅ Sélectionner offre — redirige si non connecté
  const handleSelectOffre = (offre) => {
    if (!connecte) { navigate('/auth/login'); return }
    setSelectedOffre(offre)
    setColisOffreForm(f => ({ ...f, villeDepart: offre.villeDepart, villeArrivee: offre.villeArrivee }))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const offresFiltrees = offres.filter(o => {
    const d = searchOffre.depart.toLowerCase()
    const a = searchOffre.arrivee.toLowerCase()
    return (!d || o.villeDepart?.toLowerCase().includes(d)) &&
           (!a || o.villeArrivee?.toLowerCase().includes(a))
  })

  return (
    <>
      <Header />
      <div style={{ marginTop:108, background:'#F9FAFB', minHeight:'100vh' }}>

        {/* Hero */}
        <div style={{ background:'#C2410C', padding:'1.8rem 3rem' }}>
          <div style={{ maxWidth:1280, margin:'0 auto' }}>
            <div style={{ fontSize:'0.72rem', color:'rgba(255,255,255,0.6)', marginBottom:4, fontFamily:'system-ui,sans-serif' }}>Service livraison</div>
            <h1 style={{ fontWeight:700, fontSize:'1.5rem', color:'white', marginBottom:'0.4rem', fontFamily:'system-ui,sans-serif' }}>
              Livraison de colis sécurisée
            </h1>
            <p style={{ color:'rgba(255,255,255,0.7)', fontSize:'0.85rem', fontFamily:'system-ui,sans-serif', margin:0 }}>
              Envoyez vos colis avec nos conducteurs vérifiés. Validation par code OTP unique.
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ background:'white', borderBottom:'1px solid #E5E7EB' }}>
          <div style={{ maxWidth:1280, margin:'0 auto', padding:'0 3rem', display:'flex', overflowX:'auto' }}>
            {TABS.map(t => (
              <button key={t} onClick={() => { setTab(t); setError(''); setOtpError(''); setOtpResult(null); setSelectedOffre(null) }}
                style={{ padding:'0.8rem 1.2rem', border:'none', background:'transparent', cursor:'pointer', fontSize:'0.85rem', fontWeight: tab===t ? 600 : 400, color: tab===t ? '#C2410C' : '#6B7280', borderBottom: tab===t ? '2px solid #C2410C' : '2px solid transparent', whiteSpace:'nowrap', fontFamily:'system-ui,sans-serif' }}>
                {t}
              </button>
            ))}
          </div>
        </div>

        <div style={{ maxWidth:1280, margin:'0 auto', padding:'2rem 3rem' }}>

          {/* ✅ OFFRES CONDUCTEURS */}
          {tab === 'Offres conducteurs' && (
            <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>

              {/* Formulaire colis si offre sélectionnée */}
              {selectedOffre && (
                <Card style={{ padding:'1.5rem', border:'2px solid #C2410C', boxShadow:'0 4px 16px rgba(194,65,12,0.1)' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.2rem' }}>
                    <div>
                      <div style={{ display:'inline-flex', alignItems:'center', gap:'0.4rem', background:'#FEF0EC', color:'#C2410C', padding:'0.2rem 0.7rem', borderRadius:50, fontSize:'0.72rem', fontWeight:600, marginBottom:6, fontFamily:'system-ui,sans-serif' }}>
                        <span style={{ width:4, height:4, background:'#C2410C', borderRadius:'50%' }} /> Envoi de colis
                      </div>
                      <div style={{ fontWeight:700, fontSize:'1rem', color:'#111827', fontFamily:'system-ui,sans-serif' }}>
                        {selectedOffre.villeDepart} → {selectedOffre.villeArrivee}
                      </div>
                      <div style={{ fontSize:'0.78rem', color:'#6B7280', fontFamily:'system-ui,sans-serif' }}>
                        Conducteur : {selectedOffre.nomConducteur} · {selectedOffre.prixParKg} MAD/kg · Max {selectedOffre.poidsMax} kg
                      </div>
                    </div>
                    <button onClick={() => setSelectedOffre(null)}
                      style={{ background:'#F3F4F6', border:'none', width:32, height:32, borderRadius:'50%', cursor:'pointer', fontSize:'1.1rem', color:'#6B7280', display:'flex', alignItems:'center', justifyContent:'center' }}>×</button>
                  </div>

                  {colisOffreError && (
                    <div style={{ background:'#FEF2F2', color:'#7F1D1D', padding:'0.7rem', borderRadius:8, fontSize:'0.82rem', marginBottom:'1rem', fontFamily:'system-ui,sans-serif', border:'1px solid #FECACA' }}>{colisOffreError}</div>
                  )}

                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.9rem', marginBottom:'0.9rem' }}>
                    {[['Ville de départ *','villeDepart','Ex: Béni Mellal'],['Destination *','villeArrivee','Ex: Casablanca']].map(([label,key,placeholder]) => (
                      <div key={key}>
                        <label style={labelStyle}>{label}</label>
                        <input type="text" placeholder={placeholder} value={colisOffreForm[key]}
                          onChange={e => setColisOffreForm({...colisOffreForm, [key]: e.target.value})}
                          style={inputStyle} />
                      </div>
                    ))}
                  </div>
                  {[
                    ['Description *','text','description','Ex: Vêtements, documents...'],
                    ['Poids (kg) *','number','poids','Ex: 2'],
                    ['Nom destinataire *','text','nomDestinataire','Prénom Nom'],
                    ['Téléphone destinataire *','tel','telephoneDestinataire','06 XX XX XX XX'],
                  ].map(([label,type,key,placeholder]) => (
                    <div key={key} style={{ marginBottom:'0.9rem' }}>
                      <label style={labelStyle}>{label}</label>
                      <input type={type} placeholder={placeholder} value={colisOffreForm[key]}
                        onChange={e => setColisOffreForm({...colisOffreForm, [key]: e.target.value})}
                        style={inputStyle} />
                    </div>
                  ))}

                  <div style={{ background:'#FEF9C3', border:'1px solid #FDE68A', borderRadius:8, padding:'0.7rem 1rem', marginBottom:'1rem', fontSize:'0.8rem', color:'#713F12', fontFamily:'system-ui,sans-serif' }}>
                    Le conducteur vous proposera un prix selon le poids. Vous pourrez accepter ou négocier dans votre dashboard.
                  </div>

                  <button onClick={handleEnvoyerColisOffre} disabled={colisOffreLoading}
                    style={{ width:'100%', padding:'0.85rem', background: colisOffreLoading ? '#9CA3AF' : '#C2410C', color:'white', border:'none', borderRadius:8, fontSize:'0.9rem', fontWeight:600, cursor: colisOffreLoading ? 'not-allowed' : 'pointer', fontFamily:'system-ui,sans-serif' }}>
                    {colisOffreLoading ? 'Envoi...' : 'Envoyer ma demande'}
                  </button>
                </Card>
              )}

              {/* Recherche */}
              <div style={{ display:'flex', gap:'0.8rem', flexWrap:'wrap' }}>
                <input placeholder="Ville de départ" value={searchOffre.depart}
                  onChange={e => setSearchOffre({...searchOffre, depart: e.target.value})}
                  style={{ flex:1, minWidth:180, padding:'0.75rem 1rem', border:'1px solid #D1D5DB', borderRadius:8, fontSize:'0.88rem', outline:'none', fontFamily:'system-ui,sans-serif', color:'#111827', background:'white' }} />
                <input placeholder="Ville d'arrivée" value={searchOffre.arrivee}
                  onChange={e => setSearchOffre({...searchOffre, arrivee: e.target.value})}
                  style={{ flex:1, minWidth:180, padding:'0.75rem 1rem', border:'1px solid #D1D5DB', borderRadius:8, fontSize:'0.88rem', outline:'none', fontFamily:'system-ui,sans-serif', color:'#111827', background:'white' }} />
              </div>

              <div style={{ fontWeight:600, fontSize:'0.9rem', color:'#374151', fontFamily:'system-ui,sans-serif' }}>
                {offresFiltrees.length} offre(s) disponible(s)
              </div>

              {offresLoading ? (
                <div style={{ display:'flex', flexDirection:'column', gap:'0.8rem' }}>
                  {[1,2,3].map(i => <div key={i} style={{ height:100, background:'white', borderRadius:12, border:'1px solid #E5E7EB', opacity:0.4 }} />)}
                </div>
              ) : offresFiltrees.length === 0 ? (
                <Card style={{ padding:'3rem', textAlign:'center' }}>
                  <div style={{ fontSize:'2rem', marginBottom:'0.8rem' }}>📦</div>
                  <div style={{ fontWeight:600, color:'#374151', fontFamily:'system-ui,sans-serif', marginBottom:'0.5rem' }}>Aucune offre disponible</div>
                  <div style={{ fontSize:'0.83rem', color:'#6B7280', fontFamily:'system-ui,sans-serif' }}>Les conducteurs peuvent publier leurs offres depuis leur dashboard.</div>
                </Card>
              ) : offresFiltrees.map(o => (
                <div key={o.id}
                  style={{ background:'white', borderRadius:12, border: selectedOffre?.id===o.id ? '2px solid #C2410C' : '1px solid #E5E7EB', padding:'1.2rem 1.5rem', transition:'all 0.2s', boxShadow:'0 1px 3px rgba(0,0,0,0.04)' }}
                  onMouseEnter={e => { e.currentTarget.style.boxShadow='0 4px 16px rgba(194,65,12,0.1)'; if(selectedOffre?.id!==o.id) e.currentTarget.style.borderColor='#FDBA74' }}
                  onMouseLeave={e => { e.currentTarget.style.boxShadow='0 1px 3px rgba(0,0,0,0.04)'; e.currentTarget.style.borderColor = selectedOffre?.id===o.id ? '#C2410C' : '#E5E7EB' }}>
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:'1rem' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:'1rem' }}>
                      <div style={{ width:48, height:48, borderRadius:'50%', background:'#FEF0EC', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.4rem', flexShrink:0 }}>📦</div>
                      <div>
                        <div style={{ fontWeight:700, fontSize:'1rem', color:'#111827', fontFamily:'system-ui,sans-serif' }}>
                          {o.villeDepart} → {o.villeArrivee}
                        </div>
                        <div style={{ fontSize:'0.78rem', color:'#6B7280', marginTop:2, fontFamily:'system-ui,sans-serif' }}>
                          Conducteur : <strong style={{ color:'#374151' }}>{o.nomConducteur || 'Conducteur'}</strong>
                          {o.description ? ` · ${o.description}` : ''}
                        </div>
                        <div style={{ fontSize:'0.75rem', color:'#374151', marginTop:3, fontFamily:'system-ui,sans-serif' }}>
                          <span style={{ background:'#FEF0EC', color:'#C2410C', padding:'0.15rem 0.5rem', borderRadius:4, fontWeight:600, marginRight:6 }}>
                            {o.prixParKg} MAD/kg
                          </span>
                          <span style={{ background:'#F3F4F6', color:'#374151', padding:'0.15rem 0.5rem', borderRadius:4, fontWeight:500, marginRight:6 }}>
                            Max {o.poidsMax} kg
                          </span>
                          <span style={{ background:'#F3F4F6', color:'#374151', padding:'0.15rem 0.5rem', borderRadius:4, fontWeight:500 }}>
                            {o.poidsRestant ?? o.poidsMax} kg restants
                          </span>
                        </div>
                      </div>
                    </div>
                    <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:'0.5rem' }}>
                      <div style={{ fontWeight:800, fontSize:'1.2rem', color:'#C2410C', fontFamily:'system-ui,sans-serif' }}>
                        {o.prixParKg} MAD/kg
                      </div>
                      <button
                        onClick={() => handleSelectOffre(o)}
                        style={{ background:'#C2410C', color:'white', border:'none', borderRadius:8, padding:'0.5rem 1.2rem', fontWeight:600, fontSize:'0.83rem', cursor:'pointer', fontFamily:'system-ui,sans-serif', transition:'all 0.2s' }}
                        onMouseEnter={e => { e.currentTarget.style.background='#9A3412'; e.currentTarget.style.transform='translateY(-1px)' }}
                        onMouseLeave={e => { e.currentTarget.style.background='#C2410C'; e.currentTarget.style.transform='translateY(0)' }}>
                        {connecte ? 'Envoyer un colis' : '🔐 Se connecter'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ENVOYER UN COLIS — visible seulement si connecté */}
          {tab === 'Envoyer un colis' && (
            <div>
              <div style={{ display:'flex', alignItems:'center', marginBottom:'2rem' }}>
                {[['1','Infos colis'],['2','Confirmation'],['3','OTP généré']].map(([num,label],i) => (
                  <div key={num} style={{ display:'flex', alignItems:'center', flex: i<2 ? 1 : 'none' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:'0.5rem' }}>
                      <div style={{ width:32, height:32, borderRadius:'50%', background: step>=parseInt(num) ? '#C2410C' : '#E5E7EB', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, fontSize:'0.85rem', color: step>=parseInt(num) ? 'white' : '#9CA3AF', flexShrink:0, fontFamily:'system-ui,sans-serif' }}>{num}</div>
                      <span style={{ fontSize:'0.82rem', fontWeight: step===parseInt(num) ? 600 : 400, color: step===parseInt(num) ? '#111827' : '#9CA3AF', whiteSpace:'nowrap', fontFamily:'system-ui,sans-serif' }}>{label}</span>
                    </div>
                    {i < 2 && <div style={{ flex:1, height:1, background: step>parseInt(num) ? '#C2410C' : '#E5E7EB', margin:'0 1rem' }} />}
                  </div>
                ))}
              </div>

              {step === 1 && (
                <Card style={{ padding:'1.8rem' }}>
                  <div style={{ fontWeight:600, fontSize:'1rem', color:'#111827', marginBottom:'1.3rem', fontFamily:'system-ui,sans-serif' }}>Informations sur le colis</div>
                  {error && <div style={{ background:'#FEF2F2', color:'#7F1D1D', padding:'0.7rem', borderRadius:6, fontSize:'0.82rem', marginBottom:'1rem', fontFamily:'system-ui,sans-serif', border:'1px solid #FECACA' }}>{error}</div>}
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.9rem', marginBottom:'0.9rem' }}>
                    {[['Ville de départ *','text','villeDepart','Ex: Béni Mellal'],['Ville de destination *','text','villeArrivee','Ex: Casablanca']].map(([label,type,key,placeholder]) => (
                      <div key={key}>
                        <label style={labelStyle}>{label}</label>
                        <input type={type} placeholder={placeholder} value={form[key]} onChange={e => setForm({...form, [key]: e.target.value})} style={inputStyle} />
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
                      <input type={type} placeholder={placeholder} value={form[key]} onChange={e => setForm({...form, [key]: e.target.value})} style={inputStyle} />
                    </div>
                  ))}
                  <div style={{ background:'#FEF9C3', border:'1px solid #FDE68A', borderRadius:6, padding:'0.8rem 1rem', marginBottom:'1.2rem', fontSize:'0.8rem', color:'#713F12', fontFamily:'system-ui,sans-serif' }}>
                    Un code OTP unique sera généré. Le conducteur ne peut valider la livraison qu'avec ce code.
                  </div>
                  <button onClick={() => { setError(''); setStep(2) }}
                    style={{ width:'100%', padding:'0.85rem', background:'#C2410C', color:'white', border:'none', borderRadius:6, fontSize:'0.9rem', fontWeight:600, cursor:'pointer', fontFamily:'system-ui,sans-serif' }}>
                    Continuer
                  </button>
                </Card>
              )}

              {step === 2 && (
                <Card style={{ padding:'1.8rem' }}>
                  <div style={{ fontWeight:600, fontSize:'1rem', color:'#111827', marginBottom:'1.3rem', fontFamily:'system-ui,sans-serif' }}>Confirmer l'envoi</div>
                  <div style={{ background:'#F9FAFB', borderRadius:8, padding:'1.2rem', marginBottom:'1.3rem', border:'1px solid #E5E7EB' }}>
                    {[['Départ', form.villeDepart],['Destination', form.villeArrivee],['Contenu', form.description],['Poids', `${form.poids} kg`],['Destinataire', form.nomDestinataire],['Téléphone', form.telephoneDestinataire]].map(([label, val]) => (
                      <div key={label} style={{ display:'flex', justifyContent:'space-between', padding:'0.5rem 0', borderBottom:'1px solid #F3F4F6' }}>
                        <span style={{ fontSize:'0.82rem', color:'#6B7280', fontFamily:'system-ui,sans-serif' }}>{label}</span>
                        <span style={{ fontSize:'0.82rem', color:'#111827', fontWeight:600, fontFamily:'system-ui,sans-serif' }}>{val}</span>
                      </div>
                    ))}
                  </div>
                  {error && <div style={{ background:'#FEF2F2', color:'#7F1D1D', padding:'0.7rem', borderRadius:6, fontSize:'0.82rem', marginBottom:'1rem', fontFamily:'system-ui,sans-serif', border:'1px solid #FECACA' }}>{error}</div>}
                  <div style={{ display:'flex', gap:'0.8rem' }}>
                    <button onClick={() => setStep(1)}
                      style={{ flex:1, padding:'0.85rem', background:'white', color:'#374151', border:'1px solid #D1D5DB', borderRadius:6, fontSize:'0.88rem', fontWeight:500, cursor:'pointer', fontFamily:'system-ui,sans-serif' }}>
                      Modifier
                    </button>
                    <button onClick={handleEnvoyer} disabled={loading}
                      style={{ flex:2, padding:'0.85rem', background: loading ? '#9CA3AF' : '#C2410C', color:'white', border:'none', borderRadius:6, fontSize:'0.9rem', fontWeight:600, cursor: loading ? 'not-allowed' : 'pointer', fontFamily:'system-ui,sans-serif' }}>
                      {loading ? 'Envoi en cours...' : "Confirmer l'envoi"}
                    </button>
                  </div>
                </Card>
              )}

              {step === 3 && colisCreé && (
                <Card style={{ padding:'2rem', textAlign:'center' }}>
                  <div style={{ width:56, height:56, borderRadius:'50%', background:'#DCFCE7', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 1rem', fontSize:'1.5rem' }}>✓</div>
                  <div style={{ fontWeight:700, fontSize:'1.2rem', color:'#111827', marginBottom:'0.5rem', fontFamily:'system-ui,sans-serif' }}>Colis enregistré</div>
                  <p style={{ color:'#6B7280', fontSize:'0.85rem', marginBottom:'1.5rem', fontFamily:'system-ui,sans-serif' }}>
                    {colisCreé.villeDepart} → {colisCreé.villeArrivee}
                  </p>
                  <div style={{ marginBottom:'1.5rem' }}>
                    <div style={{ fontSize:'0.72rem', color:'#6B7280', fontWeight:600, marginBottom:'0.6rem', textTransform:'uppercase', fontFamily:'system-ui,sans-serif' }}>Code OTP de livraison</div>
                    <div style={{ background:'#111827', color:'#FCD34D', padding:'1rem 2rem', borderRadius:8, fontFamily:'monospace', fontSize:'2.2rem', fontWeight:700, letterSpacing:10, display:'inline-block' }}>
                      {colisCreé.codeOTP}
                    </div>
                  </div>
                  <div style={{ background:'#FEF9C3', border:'1px solid #FDE68A', borderRadius:6, padding:'0.8rem 1rem', marginBottom:'1.5rem', fontSize:'0.8rem', color:'#713F12', fontFamily:'system-ui,sans-serif' }}>
                    Communiquez ce code uniquement au destinataire <strong>{colisCreé.nomDestinataire}</strong>.
                  </div>
                  <div style={{ display:'flex', gap:'0.8rem', justifyContent:'center' }}>
                    <button onClick={() => navigate('/dashboard/client?tab=colis')}
                      style={{ background:'#00875A', color:'white', border:'none', borderRadius:6, padding:'0.75rem 1.5rem', fontWeight:600, fontSize:'0.85rem', cursor:'pointer', fontFamily:'system-ui,sans-serif' }}>
                      Voir mes colis
                    </button>
                    <button onClick={() => { setStep(1); setForm(emptyForm); setColisCreé(null) }}
                      style={{ background:'white', color:'#374151', border:'1px solid #D1D5DB', borderRadius:6, padding:'0.75rem 1.2rem', fontWeight:500, fontSize:'0.85rem', cursor:'pointer', fontFamily:'system-ui,sans-serif' }}>
                      Nouveau colis
                    </button>
                  </div>
                </Card>
              )}
            </div>
          )}

          {/* SUIVRE UN COLIS */}
          {tab === 'Suivre un colis' && (
            <Card style={{ padding:'1.8rem' }}>
              <div style={{ fontWeight:600, fontSize:'1rem', color:'#111827', marginBottom:'0.4rem', fontFamily:'system-ui,sans-serif' }}>Suivre un colis</div>
              <p style={{ color:'#6B7280', fontSize:'0.83rem', marginBottom:'1.3rem', fontFamily:'system-ui,sans-serif' }}>
                Entrez le code OTP à 6 chiffres pour voir le statut de votre livraison.
              </p>
              <div style={{ display:'flex', gap:'0.8rem', marginBottom:'1.2rem' }}>
                <input type="text" placeholder="Code OTP (6 chiffres)"
                  value={otpInput}
                  onChange={e => { setOtpInput(e.target.value.replace(/\D/g,'')); setOtpError(''); setOtpResult(null) }}
                  maxLength={6}
                  style={{ flex:1, padding:'0.75rem 1rem', border:'1px solid #D1D5DB', borderRadius:6, fontSize:'1.2rem', outline:'none', fontFamily:'monospace', textAlign:'center', letterSpacing:6, color:'#111827' }}
                />
                <button onClick={handleSuivi} disabled={loading}
                  style={{ background:'#C2410C', color:'white', border:'none', borderRadius:6, padding:'0.75rem 1.5rem', fontWeight:600, fontSize:'0.85rem', cursor: loading ? 'not-allowed' : 'pointer', fontFamily:'system-ui,sans-serif' }}>
                  {loading ? 'Recherche...' : 'Rechercher'}
                </button>
              </div>
              {otpError && <div style={{ background:'#FEF2F2', color:'#7F1D1D', padding:'0.7rem', borderRadius:6, fontSize:'0.82rem', marginBottom:'1rem', fontFamily:'system-ui,sans-serif', border:'1px solid #FECACA' }}>{otpError}</div>}
              {otpResult && otpResult !== 'non trouvé' && (
                <div style={{ background:'#F9FAFB', borderRadius:8, padding:'1.2rem', border:'1px solid #E5E7EB' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1rem' }}>
                    <div style={{ fontWeight:600, fontSize:'0.95rem', color:'#111827', fontFamily:'system-ui,sans-serif' }}>{otpResult.description}</div>
                    <Badge statut={otpResult.statut} />
                  </div>
                  {[['Départ', otpResult.villeDepart],['Destination', otpResult.villeArrivee],['Poids', `${otpResult.poids} kg`],['Destinataire', otpResult.nomDestinataire],...(otpResult.nomConducteur ? [['Conducteur', otpResult.nomConducteur]] : [])].map(([label, val]) => (
                    <div key={label} style={{ display:'flex', justifyContent:'space-between', padding:'0.5rem 0', borderBottom:'1px solid #F3F4F6' }}>
                      <span style={{ fontSize:'0.82rem', color:'#6B7280', fontFamily:'system-ui,sans-serif' }}>{label}</span>
                      <span style={{ fontSize:'0.82rem', color:'#111827', fontWeight:600, fontFamily:'system-ui,sans-serif' }}>{val}</span>
                    </div>
                  ))}
                </div>
              )}
              {otpResult === 'non trouvé' && (
                <div style={{ background:'#FEF2F2', color:'#7F1D1D', padding:'0.9rem', borderRadius:6, fontSize:'0.83rem', fontFamily:'system-ui,sans-serif', border:'1px solid #FECACA', textAlign:'center' }}>
                  Aucun colis trouvé avec ce code OTP.
                </div>
              )}
            </Card>
          )}

          {/* MES ENVOIS */}
          {tab === 'Mes envois' && (
            <div style={{ display:'flex', flexDirection:'column', gap:'0.8rem' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'0.5rem' }}>
                <span style={{ fontWeight:600, fontSize:'0.95rem', color:'#111827', fontFamily:'system-ui,sans-serif' }}>Mes envois</span>
                <button onClick={() => setTab('Envoyer un colis')}
                  style={{ background:'#C2410C', color:'white', border:'none', borderRadius:6, padding:'0.5rem 1.1rem', fontWeight:600, fontSize:'0.83rem', cursor:'pointer', fontFamily:'system-ui,sans-serif' }}>
                  Nouveau colis
                </button>
              </div>
              {colisLoading ? (
                <div style={{ display:'flex', flexDirection:'column', gap:'0.6rem' }}>
                  {[1,2].map(i => <div key={i} style={{ background:'white', borderRadius:8, height:80, border:'1px solid #E5E7EB', opacity:0.4 }} />)}
                </div>
              ) : colis.length === 0 ? (
                <Card style={{ padding:'2.5rem', textAlign:'center' }}>
                  <div style={{ fontWeight:500, color:'#374151', marginBottom:'0.5rem', fontFamily:'system-ui,sans-serif' }}>Aucun colis envoyé</div>
                  <button onClick={() => setTab('Envoyer un colis')}
                    style={{ background:'#C2410C', color:'white', border:'none', borderRadius:6, padding:'0.6rem 1.2rem', fontWeight:600, cursor:'pointer', fontFamily:'system-ui,sans-serif', fontSize:'0.83rem', marginTop:'0.8rem' }}>
                    Envoyer un colis
                  </button>
                </Card>
              ) : colis.map(c => (
                <Card key={c.id} style={{ padding:'1.2rem' }}>
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:'0.8rem' }}>
                    <div>
                      <div style={{ fontWeight:600, fontSize:'0.9rem', color:'#111827', fontFamily:'system-ui,sans-serif' }}>
                        {c.description} · {c.villeDepart} → {c.villeArrivee}
                      </div>
                      <div style={{ fontSize:'0.75rem', color:'#4B5563', marginTop:3, fontFamily:'system-ui,sans-serif' }}>
                        {c.poids} kg · {c.nomDestinataire} · {c.telephoneDestinataire}
                        {c.prix ? ` · ${c.prix} MAD` : ''}
                      </div>
                      {c.nomConducteur && (
                        <div style={{ fontSize:'0.73rem', color:'#00875A', marginTop:2, fontWeight:600, fontFamily:'system-ui,sans-serif' }}>
                          Conducteur : {c.nomConducteur}
                        </div>
                      )}
                    </div>
                    <Badge statut={c.statut} />
                  </div>
                  {(c.statut === 'EN_ATTENTE' || c.statut === 'EN_TRANSIT') && (
                    <div style={{ marginTop:'0.9rem', paddingTop:'0.9rem', borderTop:'1px solid #F3F4F6', display:'flex', alignItems:'center', gap:'1rem', flexWrap:'wrap' }}>
                      <span style={{ fontSize:'0.75rem', color:'#6B7280', fontFamily:'system-ui,sans-serif' }}>Code OTP :</span>
                      <div style={{ background:'#111827', color:'#FCD34D', padding:'0.4rem 1rem', borderRadius:6, fontFamily:'monospace', fontSize:'1.2rem', fontWeight:700, letterSpacing:6 }}>
                        {c.codeOTP}
                      </div>
                      <span style={{ fontSize:'0.72rem', color:'#9CA3AF', fontFamily:'system-ui,sans-serif' }}>À communiquer uniquement au destinataire</span>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          )}

        </div>
      </div>
      <Footer />
    </>
  )
}