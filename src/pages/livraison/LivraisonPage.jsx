import { useState } from 'react'
import Header from '../../components/layout/Header'
import Footer from '../../components/layout/Footer'

function Card({ children, style }) {
  return <div style={{ background:'white', borderRadius:16, border:'1px solid var(--border)', ...style }}>{children}</div>
}

const TABS = ['Envoyer un colis','Suivre un colis','Mes envois']

const mesEnvois = [
  { id:1, description:'Vêtements', destination:'Casablanca', conducteur:'Youssef A.', poids:'3 kg', otp:'482910', statut:'en transit', date:'28 Avr 2026', prix:'60 MAD' },
  { id:2, description:'Documents', destination:'Rabat', conducteur:'Karim F.', poids:'0.5 kg', otp:'739201', statut:'livré', date:'20 Avr 2026', prix:'40 MAD' },
]

const COLORS = {
  'en transit': { bg:'#E6F1FB', color:'#185FA5' },
  'livré':      { bg:'#E8F5F0', color:'#005C3E' },
  'en attente': { bg:'#FFF8E6', color:'#92610A' },
}

function Badge({ statut }) {
  const s = COLORS[statut] || { bg:'#eee', color:'#555' }
  return <span style={{ ...s, padding:'0.3rem 0.9rem', borderRadius:20, fontSize:'0.75rem', fontWeight:700 }}>{statut}</span>
}

export default function LivraisonPage() {
  const [tab, setTab] = useState('Envoyer un colis')
  const [otpInput, setOtpInput] = useState('')
  const [otpResult, setOtpResult] = useState(null)
  const [step, setStep] = useState(1)

  const handleSuivi = () => {
    const found = mesEnvois.find(e => e.otp === otpInput)
    setOtpResult(found || 'non trouvé')
  }

  return (
    <>
      <Header />
      <div style={{ marginTop:108, background:'var(--gray)', minHeight:'100vh' }}>

        {/* Hero */}
        <div style={{ background:'linear-gradient(135deg,#FF6B35 0%,#E85D27 100%)', padding:'2.5rem 3rem' }}>
          <div style={{ maxWidth:1280, margin:'0 auto' }}>
            <p style={{ color:'rgba(255,255,255,0.75)', fontSize:'0.85rem', marginBottom:6 }}>Service livraison 📦</p>
            <h1 style={{ fontFamily:'Bricolage Grotesque,sans-serif', fontWeight:800, fontSize:'2rem', color:'white', marginBottom:'0.5rem' }}>Livraison de colis sécurisée</h1>
            <p style={{ color:'rgba(255,255,255,0.75)', fontSize:'0.95rem' }}>Envoyez vos colis avec nos conducteurs vérifiés. Validation par code OTP unique.</p>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ background:'white', borderBottom:'1px solid var(--border)', position:'sticky', top:108, zIndex:10 }}>
          <div style={{ maxWidth:1280, margin:'0 auto', padding:'0 3rem', display:'flex', overflowX:'auto' }}>
            {TABS.map(t => (
              <button key={t} onClick={() => setTab(t)} style={{ padding:'1rem 1.4rem', border:'none', background:'transparent', cursor:'pointer', fontSize:'0.88rem', fontWeight: tab===t ? 700 : 400, color: tab===t ? 'var(--accent)' : 'var(--muted)', borderBottom: tab===t ? '2.5px solid var(--accent)' : '2.5px solid transparent', whiteSpace:'nowrap', fontFamily:'inherit' }}>
                {t}
              </button>
            ))}
          </div>
        </div>

        <div style={{ maxWidth:900, margin:'0 auto', padding:'2.5rem 3rem' }}>

          {/* ENVOYER */}
          {tab === 'Envoyer un colis' && (
            <div>
              {/* Étapes */}
              <div style={{ display:'flex', alignItems:'center', gap:'0', marginBottom:'2.5rem' }}>
                {[['1','Infos colis'],['2','Trajet'],['3','Confirmation']].map(([num,label],i) => (
                  <div key={num} style={{ display:'flex', alignItems:'center', flex: i<2 ? 1 : 'none' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:'0.5rem' }}>
                      <div style={{ width:36, height:36, borderRadius:'50%', background: step>=parseInt(num) ? 'var(--accent)' : 'var(--gray2)', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:800, fontSize:'0.9rem', color: step>=parseInt(num) ? 'white' : 'var(--muted)', flexShrink:0 }}>{num}</div>
                      <span style={{ fontSize:'0.85rem', fontWeight: step===parseInt(num) ? 700 : 400, color: step===parseInt(num) ? 'var(--dark)' : 'var(--muted)', whiteSpace:'nowrap' }}>{label}</span>
                    </div>
                    {i < 2 && <div style={{ flex:1, height:2, background: step>parseInt(num) ? 'var(--accent)' : 'var(--gray2)', margin:'0 1rem' }} />}
                  </div>
                ))}
              </div>

              {step === 1 && (
                <Card style={{ padding:'2rem' }}>
                  <h3 style={{ fontFamily:'Bricolage Grotesque,sans-serif', fontWeight:800, fontSize:'1.1rem', marginBottom:'1.5rem' }}>Informations sur le colis</h3>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem', marginBottom:'1rem' }}>
                    {[['Ville de départ','text','Ex: Béni Mellal'],['Ville de destination','text','Ex: Casablanca']].map(([label,type,placeholder]) => (
                      <div key={label}>
                        <label style={{ fontSize:'0.75rem', fontWeight:700, color:'var(--muted)', textTransform:'uppercase', letterSpacing:'0.5px', display:'block', marginBottom:'0.4rem' }}>{label}</label>
                        <input type={type} placeholder={placeholder} style={{ width:'100%', padding:'0.85rem 1rem', border:'1.5px solid var(--border)', borderRadius:10, fontSize:'0.92rem', outline:'none', fontFamily:'inherit' }} />
                      </div>
                    ))}
                  </div>
                  {[['Description du contenu','text','Ex: Vêtements, documents...'],['Poids estimé (kg)','number','Ex: 2'],['Nom du destinataire','text','Prénom Nom'],['Téléphone destinataire','tel','06 XX XX XX XX']].map(([label,type,placeholder]) => (
                    <div key={label} style={{ marginBottom:'1rem' }}>
                      <label style={{ fontSize:'0.75rem', fontWeight:700, color:'var(--muted)', textTransform:'uppercase', letterSpacing:'0.5px', display:'block', marginBottom:'0.4rem' }}>{label}</label>
                      <input type={type} placeholder={placeholder} style={{ width:'100%', padding:'0.85rem 1rem', border:'1.5px solid var(--border)', borderRadius:10, fontSize:'0.92rem', outline:'none', fontFamily:'inherit' }} />
                    </div>
                  ))}
                  <div style={{ background:'#FFF8E6', borderRadius:10, padding:'1rem', marginBottom:'1.5rem', display:'flex', gap:'0.8rem' }}>
                    <span style={{ fontSize:'1.2rem' }}>🔐</span>
                    <div>
                      <div style={{ fontWeight:600, color:'#92610A', fontSize:'0.88rem', marginBottom:2 }}>Sécurité OTP</div>
                      <div style={{ color:'#92610A', fontSize:'0.82rem' }}>Un code unique sera généré et envoyé au destinataire. Le conducteur ne peut valider la livraison qu'avec ce code.</div>
                    </div>
                  </div>
                  <button onClick={() => setStep(2)} style={{ width:'100%', padding:'1rem', background:'var(--accent)', color:'white', border:'none', borderRadius:10, fontSize:'1rem', fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}>
                    Continuer →
                  </button>
                </Card>
              )}

              {step === 2 && (
                <Card style={{ padding:'2rem' }}>
                  <h3 style={{ fontFamily:'Bricolage Grotesque,sans-serif', fontWeight:800, fontSize:'1.1rem', marginBottom:'1.5rem' }}>Choisir un trajet disponible</h3>
                  {[
                    { conducteur:'Youssef A.', trajet:'Béni Mellal → Casa', date:'29 Avr · 08:00', note:4.9, prix:'60 MAD', dispo:true },
                    { conducteur:'Karim F.', trajet:'Béni Mellal → Casa', date:'29 Avr · 14:00', note:4.7, prix:'50 MAD', dispo:true },
                  ].map((c,i) => (
                    <div key={i} style={{ border:'1.5px solid var(--border)', borderRadius:12, padding:'1.2rem', marginBottom:'1rem', cursor:'pointer', transition:'all 0.2s' }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor='var(--accent)'; e.currentTarget.style.background='#FFF6F3' }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor='var(--border)'; e.currentTarget.style.background='white' }}>
                      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:'0.5rem' }}>
                        <div style={{ display:'flex', alignItems:'center', gap:'0.8rem' }}>
                          <div style={{ width:40, height:40, borderRadius:'50%', background:'var(--primary-light)', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, fontSize:'0.82rem', color:'var(--primary)' }}>{c.conducteur.split(' ').map(n=>n[0]).join('')}</div>
                          <div>
                            <div style={{ fontWeight:700, color:'var(--dark)', fontSize:'0.92rem' }}>{c.conducteur}</div>
                            <div style={{ fontSize:'0.8rem', color:'var(--muted)' }}>🚗 {c.trajet} · 📅 {c.date} · ⭐ {c.note}</div>
                          </div>
                        </div>
                        <div style={{ display:'flex', alignItems:'center', gap:'0.8rem' }}>
                          <span style={{ fontFamily:'Bricolage Grotesque,sans-serif', fontWeight:800, fontSize:'1.1rem', color:'var(--dark)' }}>{c.prix}</span>
                          <button onClick={() => setStep(3)} style={{ background:'var(--accent)', color:'white', border:'none', borderRadius:8, padding:'0.5rem 1.2rem', fontSize:'0.85rem', fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}>Choisir</button>
                        </div>
                      </div>
                    </div>
                  ))}
                  <button onClick={() => setStep(1)} style={{ background:'transparent', color:'var(--muted)', border:'1.5px solid var(--border)', borderRadius:10, padding:'0.85rem', width:'100%', fontFamily:'inherit', cursor:'pointer', fontSize:'0.9rem' }}>← Retour</button>
                </Card>
              )}

              {step === 3 && (
                <Card style={{ padding:'2rem', textAlign:'center' }}>
                  <div style={{ width:80, height:80, borderRadius:'50%', background:'#E8F5F0', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'2.2rem', margin:'0 auto 1.2rem' }}>✅</div>
                  <h3 style={{ fontFamily:'Bricolage Grotesque,sans-serif', fontWeight:800, fontSize:'1.4rem', color:'var(--dark)', marginBottom:'0.6rem' }}>Colis enregistré !</h3>
                  <p style={{ color:'var(--muted)', fontSize:'0.9rem', lineHeight:1.6, marginBottom:'1.5rem' }}>Votre demande a été envoyée au conducteur. Un code OTP a été généré pour la livraison.</p>
                  <div style={{ background:'var(--dark)', color:'var(--gold)', padding:'1rem 2rem', borderRadius:12, fontFamily:'monospace', fontSize:'2rem', fontWeight:800, letterSpacing:8, display:'inline-block', marginBottom:'1.5rem' }}>
                    482910
                  </div>
                  <p style={{ color:'var(--muted)', fontSize:'0.82rem', marginBottom:'2rem' }}>🔐 Communiquez ce code uniquement au destinataire</p>
                  <button onClick={() => { setStep(1); setTab('Mes envois') }} style={{ background:'var(--primary)', color:'white', border:'none', borderRadius:10, padding:'0.9rem 2rem', fontWeight:700, fontSize:'0.95rem', cursor:'pointer', fontFamily:'inherit' }}>
                    Voir mes envois
                  </button>
                </Card>
              )}
            </div>
          )}

          {/* SUIVRE */}
          {tab === 'Suivre un colis' && (
            <Card style={{ padding:'2rem' }}>
              <h3 style={{ fontFamily:'Bricolage Grotesque,sans-serif', fontWeight:800, fontSize:'1.1rem', marginBottom:'0.5rem' }}>Suivre un colis par code OTP</h3>
              <p style={{ color:'var(--muted)', fontSize:'0.88rem', marginBottom:'1.5rem' }}>Entrez le code OTP pour voir le statut de la livraison.</p>
              <div style={{ display:'flex', gap:'0.8rem', marginBottom:'1.5rem', flexWrap:'wrap' }}>
                <input type="text" placeholder="Code OTP (6 chiffres)" value={otpInput} onChange={e => setOtpInput(e.target.value)} maxLength={6} style={{ flex:1, minWidth:180, padding:'0.85rem 1rem', border:'1.5px solid var(--border)', borderRadius:10, fontSize:'1.1rem', outline:'none', fontFamily:'monospace', textAlign:'center', letterSpacing:4 }} />
                <button onClick={handleSuivi} style={{ background:'var(--accent)', color:'white', border:'none', borderRadius:10, padding:'0.85rem 2rem', fontWeight:700, fontSize:'0.95rem', cursor:'pointer', fontFamily:'inherit' }}>Rechercher</button>
              </div>
              {otpResult && otpResult !== 'non trouvé' && (
                <div style={{ background:'var(--gray)', borderRadius:12, padding:'1.5rem' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:'0.5rem', marginBottom:'1rem' }}>
                    <div style={{ fontFamily:'Bricolage Grotesque,sans-serif', fontWeight:700, fontSize:'1.05rem', color:'var(--dark)' }}>📦 {otpResult.description} → {otpResult.destination}</div>
                    <span style={{ background: COLORS[otpResult.statut]?.bg, color: COLORS[otpResult.statut]?.color, padding:'0.3rem 0.9rem', borderRadius:20, fontSize:'0.75rem', fontWeight:700 }}>{otpResult.statut}</span>
                  </div>
                  <div style={{ fontSize:'0.85rem', color:'var(--muted)' }}>🚗 {otpResult.conducteur} · ⚖️ {otpResult.poids} · 📅 {otpResult.date} · {otpResult.prix}</div>
                </div>
              )}
              {otpResult === 'non trouvé' && (
                <div style={{ background:'#FDEDED', borderRadius:10, padding:'1rem', color:'#C62828', fontSize:'0.88rem', fontWeight:600 }}>
                  ❌ Aucun colis trouvé avec ce code OTP.
                </div>
              )}
            </Card>
          )}

          {/* MES ENVOIS */}
          {tab === 'Mes envois' && (
            <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
              <h2 style={{ fontFamily:'Bricolage Grotesque,sans-serif', fontSize:'1.5rem', fontWeight:800, color:'var(--dark)' }}>Mes envois</h2>
              {mesEnvois.map(e => (
                <Card key={e.id} style={{ padding:'1.5rem' }}>
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:'1rem' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:'1rem' }}>
                      <div style={{ width:48, height:48, background:'#FFF0E8', borderRadius:12, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.4rem' }}>📦</div>
                      <div>
                        <div style={{ fontFamily:'Bricolage Grotesque,sans-serif', fontWeight:700, fontSize:'1.05rem', color:'var(--dark)' }}>{e.description} → {e.destination}</div>
                        <div style={{ fontSize:'0.82rem', color:'var(--muted)', marginTop:3 }}>🚗 {e.conducteur} · ⚖️ {e.poids} · 📅 {e.date} · {e.prix}</div>
                      </div>
                    </div>
                    <Badge statut={e.statut} />
                  </div>
                  {e.statut === 'en transit' && (
                    <div style={{ marginTop:'1rem', paddingTop:'1rem', borderTop:'1px solid var(--border)', display:'flex', alignItems:'center', gap:'1rem', flexWrap:'wrap' }}>
                      <span style={{ fontSize:'0.82rem', color:'var(--muted)', fontWeight:600 }}>Code OTP :</span>
                      <div style={{ background:'var(--dark)', color:'var(--gold)', padding:'0.5rem 1.4rem', borderRadius:8, fontFamily:'monospace', fontSize:'1.4rem', fontWeight:800, letterSpacing:6 }}>{e.otp}</div>
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