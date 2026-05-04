import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../../components/layout/Header'
import Footer from '../../components/layout/Footer'
import {
  creerColis,
  getMesColis,
  suivreColisOTP,
  isAuthenticated,
  getUser
} from '../../lib/api'

const COLORS = {
  'EN_TRANSIT': { bg:'#E6F1FB', color:'#185FA5' },
  'LIVRE':      { bg:'#E8F5F0', color:'#005C3E' },
  'EN_ATTENTE': { bg:'#FFF8E6', color:'#92610A' },
  'ANNULE':     { bg:'#FDEDED', color:'#C62828' },
}

function Badge({ statut }) {
  const s = COLORS[statut] || { bg:'#eee', color:'#555' }
  return <span style={{ ...s, padding:'0.3rem 0.9rem', borderRadius:20, fontSize:'0.75rem', fontWeight:700 }}>{statut?.replace('_',' ')}</span>
}

function Card({ children, style }) {
  return <div style={{ background:'white', borderRadius:16, border:'1px solid var(--border)', ...style }}>{children}</div>
}

function Loading() {
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
      {[1,2].map(i => (
        <div key={i} style={{ background:'white', borderRadius:16, height:100, border:'1px solid var(--border)', opacity:0.5 }} />
      ))}
    </div>
  )
}

const TABS = ['Envoyer un colis', 'Suivre un colis', 'Mes envois']

const emptyForm = {
  description:'', poids:'', villeDepart:'', villeArrivee:'',
  nomDestinataire:'', telephoneDestinataire:'', prix:''
}

export default function LivraisonPage() {
  const navigate = useNavigate()
  const user = getUser()
  const [tab, setTab] = useState('Envoyer un colis')
  const [step, setStep] = useState(1)
  const [form, setForm] = useState(emptyForm)
  const [colis, setColis] = useState([])
  const [colisCreé, setColisCreé] = useState(null)
  const [otpInput, setOtpInput] = useState('')
  const [otpResult, setOtpResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [colisLoading, setColisLoading] = useState(true)
  const [error, setError] = useState('')
  const [otpError, setOtpError] = useState('')

  useEffect(() => {
    if (tab === 'Mes envois') chargerColis()
  }, [tab])

  const chargerColis = async () => {
    if (!isAuthenticated()) return
    setColisLoading(true)
    try {
      const data = await getMesColis()
      setColis(Array.isArray(data) ? data : [])
    } catch (e) {
      setError('Erreur de chargement')
    } finally {
      setColisLoading(false)
    }
  }

  const handleEnvoyer = async () => {
    if (!isAuthenticated()) {
      navigate('/auth/login')
      return
    }
    if (!form.description || !form.poids || !form.villeDepart || !form.villeArrivee || !form.nomDestinataire || !form.telephoneDestinataire) {
      setError('Veuillez remplir tous les champs obligatoires')
      return
    }
    setLoading(true)
    setError('')
    try {
      const data = await creerColis({
        ...form,
        poids: parseFloat(form.poids),
        prix: form.prix ? parseFloat(form.prix) : null,
      })
      setColisCreé(data)
      setStep(3)
    } catch (e) {
      setError('Erreur lors de l\'envoi du colis')
    } finally {
      setLoading(false)
    }
  }

  const handleSuivi = async () => {
    if (!otpInput || otpInput.length !== 6) {
      setOtpError('Veuillez entrer un code OTP de 6 chiffres')
      return
    }
    setOtpError('')
    setLoading(true)
    try {
      const data = await suivreColisOTP(otpInput)
      setOtpResult(data)
    } catch (e) {
      setOtpResult('non trouvé')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Header />
      <div style={{ marginTop:108, background:'var(--gray)', minHeight:'100vh' }}>

        {/* Hero */}
        <div style={{ background:'linear-gradient(135deg,#FF6B35 0%,#E85D27 100%)', padding:'2.5rem 3rem' }}>
          <div style={{ maxWidth:1280, margin:'0 auto' }}>
            <p style={{ color:'rgba(255,255,255,0.75)', fontSize:'0.85rem', marginBottom:6 }}>Service livraison 📦</p>
            <h1 style={{ fontFamily:'Bricolage Grotesque,sans-serif', fontWeight:800, fontSize:'2rem', color:'white', marginBottom:'0.5rem' }}>
              Livraison de colis sécurisée
            </h1>
            <p style={{ color:'rgba(255,255,255,0.75)', fontSize:'0.95rem' }}>
              Envoyez vos colis avec nos conducteurs vérifiés. Validation par code OTP unique.
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ background:'white', borderBottom:'1px solid var(--border)', position:'sticky', top:108, zIndex:10 }}>
          <div style={{ maxWidth:1280, margin:'0 auto', padding:'0 3rem', display:'flex', overflowX:'auto' }}>
            {TABS.map(t => (
              <button key={t} onClick={() => { setTab(t); setError(''); setOtpError(''); setOtpResult(null) }}
                style={{ padding:'1rem 1.4rem', border:'none', background:'transparent', cursor:'pointer', fontSize:'0.88rem', fontWeight: tab===t ? 700 : 400, color: tab===t ? 'var(--accent)' : 'var(--muted)', borderBottom: tab===t ? '2.5px solid var(--accent)' : '2.5px solid transparent', whiteSpace:'nowrap', fontFamily:'inherit' }}>
                {t}
              </button>
            ))}
          </div>
        </div>

        <div style={{ maxWidth:900, margin:'0 auto', padding:'2.5rem 3rem' }}>

          {/* ── ENVOYER UN COLIS ── */}
          {tab === 'Envoyer un colis' && (
            <div>
              {/* Étapes */}
              <div style={{ display:'flex', alignItems:'center', marginBottom:'2.5rem' }}>
                {[['1','Infos colis'],['2','Confirmation'],['3','OTP généré']].map(([num,label],i) => (
                  <div key={num} style={{ display:'flex', alignItems:'center', flex: i<2 ? 1 : 'none' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:'0.5rem' }}>
                      <div style={{ width:36, height:36, borderRadius:'50%', background: step>=parseInt(num) ? 'var(--accent)' : 'var(--gray2)', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:800, fontSize:'0.9rem', color: step>=parseInt(num) ? 'white' : 'var(--muted)', flexShrink:0 }}>{num}</div>
                      <span style={{ fontSize:'0.85rem', fontWeight: step===parseInt(num) ? 700 : 400, color: step===parseInt(num) ? 'var(--dark)' : 'var(--muted)', whiteSpace:'nowrap' }}>{label}</span>
                    </div>
                    {i < 2 && <div style={{ flex:1, height:2, background: step>parseInt(num) ? 'var(--accent)' : 'var(--gray2)', margin:'0 1rem' }} />}
                  </div>
                ))}
              </div>

              {/* STEP 1 — Formulaire */}
              {step === 1 && (
                <Card style={{ padding:'2rem' }}>
                  <h3 style={{ fontFamily:'Bricolage Grotesque,sans-serif', fontWeight:800, fontSize:'1.1rem', marginBottom:'1.5rem' }}>
                    Informations sur le colis
                  </h3>

                  {error && (
                    <div style={{ background:'#FDEDED', color:'#C62828', padding:'0.8rem', borderRadius:8, fontSize:'0.85rem', marginBottom:'1rem', fontWeight:600 }}>
                      ❌ {error}
                    </div>
                  )}

                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem', marginBottom:'1rem' }}>
                    {[
                      ['Ville de départ *','text','villeDepart','Ex: Béni Mellal'],
                      ['Ville de destination *','text','villeArrivee','Ex: Casablanca'],
                    ].map(([label,type,key,placeholder]) => (
                      <div key={key}>
                        <label style={{ fontSize:'0.75rem', fontWeight:700, color:'var(--muted)', textTransform:'uppercase', letterSpacing:'0.5px', display:'block', marginBottom:'0.4rem' }}>{label}</label>
                        <input type={type} placeholder={placeholder} value={form[key]}
                          onChange={e => setForm({...form, [key]: e.target.value})}
                          style={{ width:'100%', padding:'0.85rem 1rem', border:'1.5px solid var(--border)', borderRadius:10, fontSize:'0.92rem', outline:'none', fontFamily:'inherit' }} />
                      </div>
                    ))}
                  </div>

                  {[
                    ['Description du contenu *','text','description','Ex: Vêtements, documents...'],
                    ['Poids estimé (kg) *','number','poids','Ex: 2'],
                    ['Nom du destinataire *','text','nomDestinataire','Prénom Nom'],
                    ['Téléphone destinataire *','tel','telephoneDestinataire','06 XX XX XX XX'],
                    ['Prix convenu (MAD)','number','prix','Optionnel'],
                  ].map(([label,type,key,placeholder]) => (
                    <div key={key} style={{ marginBottom:'1rem' }}>
                      <label style={{ fontSize:'0.75rem', fontWeight:700, color:'var(--muted)', textTransform:'uppercase', letterSpacing:'0.5px', display:'block', marginBottom:'0.4rem' }}>{label}</label>
                      <input type={type} placeholder={placeholder} value={form[key]}
                        onChange={e => setForm({...form, [key]: e.target.value})}
                        style={{ width:'100%', padding:'0.85rem 1rem', border:'1.5px solid var(--border)', borderRadius:10, fontSize:'0.92rem', outline:'none', fontFamily:'inherit' }} />
                    </div>
                  ))}

                  <div style={{ background:'#FFF8E6', borderRadius:10, padding:'1rem', marginBottom:'1.5rem', display:'flex', gap:'0.8rem' }}>
                    <span style={{ fontSize:'1.2rem' }}>🔐</span>
                    <div>
                      <div style={{ fontWeight:600, color:'#92610A', fontSize:'0.88rem', marginBottom:2 }}>Sécurité OTP</div>
                      <div style={{ color:'#92610A', fontSize:'0.82rem' }}>Un code unique sera généré automatiquement. Le conducteur ne peut valider la livraison qu'avec ce code communiqué par le destinataire.</div>
                    </div>
                  </div>

                  <button onClick={() => { setError(''); setStep(2) }}
                    style={{ width:'100%', padding:'1rem', background:'var(--accent)', color:'white', border:'none', borderRadius:10, fontSize:'1rem', fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}>
                    Continuer →
                  </button>
                </Card>
              )}

              {/* STEP 2 — Confirmation */}
              {step === 2 && (
                <Card style={{ padding:'2rem' }}>
                  <h3 style={{ fontFamily:'Bricolage Grotesque,sans-serif', fontWeight:800, fontSize:'1.1rem', marginBottom:'1.5rem' }}>
                    Confirmer l'envoi
                  </h3>

                  <div style={{ background:'var(--gray)', borderRadius:12, padding:'1.5rem', marginBottom:'1.5rem' }}>
                    {[
                      ['📍 Départ', form.villeDepart],
                      ['🎯 Destination', form.villeArrivee],
                      ['📦 Contenu', form.description],
                      ['⚖️ Poids', `${form.poids} kg`],
                      ['👤 Destinataire', form.nomDestinataire],
                      ['📱 Téléphone', form.telephoneDestinataire],
                      form.prix ? ['💰 Prix', `${form.prix} MAD`] : null,
                    ].filter(Boolean).map(([label, val]) => (
                      <div key={label} style={{ display:'flex', justifyContent:'space-between', padding:'0.6rem 0', borderBottom:'1px solid var(--border)' }}>
                        <span style={{ fontSize:'0.85rem', color:'var(--muted)', fontWeight:500 }}>{label}</span>
                        <span style={{ fontSize:'0.85rem', color:'var(--dark)', fontWeight:600 }}>{val}</span>
                      </div>
                    ))}
                  </div>

                  {error && (
                    <div style={{ background:'#FDEDED', color:'#C62828', padding:'0.8rem', borderRadius:8, fontSize:'0.85rem', marginBottom:'1rem', fontWeight:600 }}>
                      ❌ {error}
                    </div>
                  )}

                  <div style={{ display:'flex', gap:'0.8rem' }}>
                    <button onClick={() => setStep(1)}
                      style={{ flex:1, padding:'1rem', background:'var(--gray)', color:'var(--dark)', border:'1.5px solid var(--border)', borderRadius:10, fontSize:'0.95rem', fontWeight:600, cursor:'pointer', fontFamily:'inherit' }}>
                      ← Modifier
                    </button>
                    <button onClick={handleEnvoyer} disabled={loading}
                      style={{ flex:2, padding:'1rem', background: loading ? 'var(--muted)' : 'var(--accent)', color:'white', border:'none', borderRadius:10, fontSize:'1rem', fontWeight:700, cursor: loading ? 'not-allowed' : 'pointer', fontFamily:'inherit' }}>
                      {loading ? 'Envoi en cours...' : '✅ Confirmer l\'envoi'}
                    </button>
                  </div>
                </Card>
              )}

              {/* STEP 3 — OTP généré */}
              {step === 3 && colisCreé && (
                <Card style={{ padding:'2.5rem', textAlign:'center' }}>
                  <div style={{ width:80, height:80, borderRadius:'50%', background:'#E8F5F0', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'2.2rem', margin:'0 auto 1.2rem' }}>✅</div>
                  <h3 style={{ fontFamily:'Bricolage Grotesque,sans-serif', fontWeight:800, fontSize:'1.4rem', color:'var(--dark)', marginBottom:'0.6rem' }}>
                    Colis enregistré !
                  </h3>
                  <p style={{ color:'var(--muted)', fontSize:'0.9rem', lineHeight:1.6, marginBottom:'1.5rem' }}>
                    Votre colis de <strong>{colisCreé.villeDepart}</strong> vers <strong>{colisCreé.villeArrivee}</strong> a été enregistré avec succès.
                  </p>

                  <div style={{ marginBottom:'0.8rem' }}>
                    <p style={{ fontSize:'0.82rem', color:'var(--muted)', fontWeight:600, marginBottom:'0.6rem' }}>CODE OTP DE LIVRAISON</p>
                    <div style={{ background:'var(--dark)', color:'var(--gold)', padding:'1rem 2rem', borderRadius:12, fontFamily:'monospace', fontSize:'2.5rem', fontWeight:800, letterSpacing:10, display:'inline-block' }}>
                      {colisCreé.codeOTP}
                    </div>
                  </div>

                  <div style={{ background:'#FFF8E6', borderRadius:10, padding:'0.8rem 1rem', marginBottom:'2rem', display:'inline-block' }}>
                    <p style={{ color:'#92610A', fontSize:'0.82rem', fontWeight:600 }}>
                      🔐 Communiquez ce code uniquement au destinataire <strong>{colisCreé.nomDestinataire}</strong>
                    </p>
                  </div>

                  <div style={{ display:'flex', gap:'0.8rem', justifyContent:'center', flexWrap:'wrap' }}>
                    <button onClick={() => { setTab('Mes envois'); setStep(1); setForm(emptyForm); setColisCreé(null) }}
                      style={{ background:'var(--primary)', color:'white', border:'none', borderRadius:10, padding:'0.9rem 2rem', fontWeight:700, fontSize:'0.95rem', cursor:'pointer', fontFamily:'inherit' }}>
                      Voir mes envois
                    </button>
                    <button onClick={() => { setStep(1); setForm(emptyForm); setColisCreé(null) }}
                      style={{ background:'var(--gray)', color:'var(--dark)', border:'1.5px solid var(--border)', borderRadius:10, padding:'0.9rem 1.5rem', fontWeight:600, fontSize:'0.92rem', cursor:'pointer', fontFamily:'inherit' }}>
                      Envoyer un autre colis
                    </button>
                  </div>
                </Card>
              )}
            </div>
          )}

          {/* ── SUIVRE UN COLIS ── */}
          {tab === 'Suivre un colis' && (
            <Card style={{ padding:'2rem' }}>
              <h3 style={{ fontFamily:'Bricolage Grotesque,sans-serif', fontWeight:800, fontSize:'1.1rem', marginBottom:'0.5rem' }}>
                Suivre un colis par code OTP
              </h3>
              <p style={{ color:'var(--muted)', fontSize:'0.88rem', marginBottom:'1.5rem' }}>
                Entrez le code OTP à 6 chiffres pour voir le statut de votre livraison.
              </p>

              <div style={{ display:'flex', gap:'0.8rem', marginBottom:'1.5rem', flexWrap:'wrap' }}>
                <input
                  type="text"
                  placeholder="Ex: 482910"
                  value={otpInput}
                  onChange={e => { setOtpInput(e.target.value.replace(/\D/,'')); setOtpError(''); setOtpResult(null) }}
                  maxLength={6}
                  style={{ flex:1, minWidth:180, padding:'0.9rem 1rem', border:'1.5px solid var(--border)', borderRadius:10, fontSize:'1.5rem', outline:'none', fontFamily:'monospace', textAlign:'center', letterSpacing:6 }}
                />
                <button onClick={handleSuivi} disabled={loading}
                  style={{ background:'var(--accent)', color:'white', border:'none', borderRadius:10, padding:'0.9rem 2rem', fontWeight:700, fontSize:'0.95rem', cursor: loading ? 'not-allowed' : 'pointer', fontFamily:'inherit' }}>
                  {loading ? 'Recherche...' : '🔍 Rechercher'}
                </button>
              </div>

              {otpError && (
                <div style={{ background:'#FDEDED', color:'#C62828', padding:'0.8rem', borderRadius:8, fontSize:'0.85rem', marginBottom:'1rem', fontWeight:600 }}>
                  ❌ {otpError}
                </div>
              )}

              {otpResult && otpResult !== 'non trouvé' && (
                <div style={{ background:'var(--gray)', borderRadius:12, padding:'1.5rem' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1rem', flexWrap:'wrap', gap:'0.5rem' }}>
                    <div style={{ fontFamily:'Bricolage Grotesque,sans-serif', fontWeight:700, fontSize:'1.1rem', color:'var(--dark)' }}>
                      📦 {otpResult.description}
                    </div>
                    <Badge statut={otpResult.statut} />
                  </div>
                  {[
                    ['📍 Départ', otpResult.villeDepart],
                    ['🎯 Destination', otpResult.villeArrivee],
                    ['⚖️ Poids', `${otpResult.poids} kg`],
                    ['👤 Destinataire', otpResult.nomDestinataire],
                    ['📱 Téléphone', otpResult.telephoneDestinataire],
                    otpResult.nomConducteur ? ['🚗 Conducteur', otpResult.nomConducteur] : null,
                    otpResult.prix ? ['💰 Prix', `${otpResult.prix} MAD`] : null,
                  ].filter(Boolean).map(([label, val]) => (
                    <div key={label} style={{ display:'flex', justifyContent:'space-between', padding:'0.5rem 0', borderBottom:'1px solid var(--border)' }}>
                      <span style={{ fontSize:'0.85rem', color:'var(--muted)' }}>{label}</span>
                      <span style={{ fontSize:'0.85rem', color:'var(--dark)', fontWeight:600 }}>{val}</span>
                    </div>
                  ))}
                </div>
              )}

              {otpResult === 'non trouvé' && (
                <div style={{ background:'#FDEDED', color:'#C62828', padding:'1rem', borderRadius:10, fontWeight:600, textAlign:'center' }}>
                  ❌ Aucun colis trouvé avec ce code OTP.
                </div>
              )}
            </Card>
          )}

          {/* ── MES ENVOIS ── */}
          {tab === 'Mes envois' && (
            <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:'1rem' }}>
                <h2 style={{ fontFamily:'Bricolage Grotesque,sans-serif', fontSize:'1.5rem', fontWeight:800, color:'var(--dark)' }}>Mes envois</h2>
                <button onClick={() => setTab('Envoyer un colis')}
                  style={{ background:'var(--accent)', color:'white', border:'none', borderRadius:10, padding:'0.7rem 1.5rem', fontWeight:700, fontSize:'0.9rem', cursor:'pointer', fontFamily:'inherit' }}>
                  📦 Nouveau colis
                </button>
              </div>

              {colisLoading ? <Loading /> :
                !isAuthenticated() ? (
                  <Card style={{ padding:'3rem', textAlign:'center' }}>
                    <div style={{ fontSize:'3rem', marginBottom:'1rem' }}>🔐</div>
                    <h3 style={{ fontFamily:'Bricolage Grotesque,sans-serif', fontWeight:800, marginBottom:'0.5rem' }}>Connexion requise</h3>
                    <p style={{ color:'var(--muted)', marginBottom:'1.5rem' }}>Connectez-vous pour voir vos envois.</p>
                    <button onClick={() => navigate('/auth/login')}
                      style={{ background:'var(--primary)', color:'white', border:'none', borderRadius:10, padding:'0.8rem 2rem', fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}>
                      Se connecter
                    </button>
                  </Card>
                ) : colis.length === 0 ? (
                  <Card style={{ padding:'3rem', textAlign:'center' }}>
                    <div style={{ fontSize:'3rem', marginBottom:'1rem' }}>📦</div>
                    <h3 style={{ fontFamily:'Bricolage Grotesque,sans-serif', fontWeight:800, marginBottom:'0.5rem' }}>Aucun colis envoyé</h3>
                    <p style={{ color:'var(--muted)', marginBottom:'1.5rem' }}>Commencez à envoyer des colis avec CovoLiv.</p>
                    <button onClick={() => setTab('Envoyer un colis')}
                      style={{ background:'var(--accent)', color:'white', border:'none', borderRadius:10, padding:'0.8rem 2rem', fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}>
                      Envoyer un colis
                    </button>
                  </Card>
                ) : colis.map(c => (
                  <Card key={c.id} style={{ padding:'1.5rem' }}>
                    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:'1rem' }}>
                      <div style={{ display:'flex', alignItems:'center', gap:'1rem' }}>
                        <div style={{ width:48, height:48, background:'#FFF0E8', borderRadius:12, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.4rem' }}>📦</div>
                        <div>
                          <div style={{ fontFamily:'Bricolage Grotesque,sans-serif', fontWeight:700, fontSize:'1.05rem', color:'var(--dark)' }}>
                            {c.description} · {c.villeDepart} → {c.villeArrivee}
                          </div>
                          <div style={{ fontSize:'0.82rem', color:'var(--muted)', marginTop:3 }}>
                            ⚖️ {c.poids} kg · 👤 {c.nomDestinataire} · 📱 {c.telephoneDestinataire}
                            {c.prix ? ` · 💰 ${c.prix} MAD` : ''}
                          </div>
                        </div>
                      </div>
                      <Badge statut={c.statut} />
                    </div>

                    {/* OTP visible si en attente ou en transit */}
                    {(c.statut === 'EN_ATTENTE' || c.statut === 'EN_TRANSIT') && (
                      <div style={{ marginTop:'1rem', paddingTop:'1rem', borderTop:'1px solid var(--border)', display:'flex', alignItems:'center', gap:'1rem', flexWrap:'wrap' }}>
                        <span style={{ fontSize:'0.82rem', color:'var(--muted)', fontWeight:600 }}>Code OTP :</span>
                        <div style={{ background:'var(--dark)', color:'var(--gold)', padding:'0.5rem 1.4rem', borderRadius:8, fontFamily:'monospace', fontSize:'1.4rem', fontWeight:800, letterSpacing:6 }}>
                          {c.codeOTP}
                        </div>
                        <span style={{ fontSize:'0.78rem', color:'var(--muted)' }}>🔐 À communiquer uniquement au destinataire</span>
                      </div>
                    )}
                  </Card>
                ))
              }
            </div>
          )}

        </div>
      </div>
      <Footer />
    </>
  )
}