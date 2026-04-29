import { useState } from 'react'
import { Link } from 'react-router-dom'
import Header from '../../../components/layout/Header'
import Footer from '../../../components/layout/Footer'

const user = { nom:'Hamid Moussaoui', email:'hamid.m@gmail.com', telephone:'06 61 23 45 67', initials:'HM', note:4.8, membre:'Janvier 2025' }

const reservations = [
  { id:1, from:'Béni Mellal', to:'Casablanca', date:'29 Avril 2026', heure:'08:00', conducteur:'Youssef A.', prix:'80 MAD', statut:'confirmé' },
  { id:2, from:'Marrakech', to:'Rabat', date:'02 Mai 2026', heure:'10:30', conducteur:'Karim F.', prix:'110 MAD', statut:'en attente' },
  { id:3, from:'Fès', to:'Meknès', date:'15 Avril 2026', heure:'07:00', conducteur:'Sara B.', prix:'45 MAD', statut:'terminé' },
]

const colis = [
  { id:1, description:'Vêtements', destination:'Casablanca', poids:'3 kg', otp:'482910', statut:'en transit', date:'28 Avril 2026' },
  { id:2, description:'Électronique', destination:'Rabat', poids:'1.5 kg', otp:'739201', statut:'livré', date:'20 Avril 2026' },
]

const negociations = [
  { id:1, trajet:'Béni Mellal → Casa', monOffre:'70 MAD', offreConducteur:'80 MAD', statut:'en cours' },
  { id:2, trajet:'Agadir → Marrakech', monOffre:'60 MAD', offreConducteur:'60 MAD', statut:'accepté' },
]

const COLORS = {
  'confirmé':    { bg:'#E8F5F0', color:'#005C3E' },
  'en attente':  { bg:'#FFF8E6', color:'#92610A' },
  'terminé':     { bg:'#F1F1F1', color:'#555' },
  'en transit':  { bg:'#E6F1FB', color:'#185FA5' },
  'livré':       { bg:'#E8F5F0', color:'#005C3E' },
  'en cours':    { bg:'#FFF8E6', color:'#92610A' },
  'accepté':     { bg:'#E8F5F0', color:'#005C3E' },
}

function Badge({ statut }) {
  const s = COLORS[statut] || { bg:'#eee', color:'#555' }
  return <span style={{ ...s, padding:'0.3rem 0.9rem', borderRadius:20, fontSize:'0.75rem', fontWeight:700, whiteSpace:'nowrap' }}>{statut}</span>
}

function Card({ children, style }) {
  return <div style={{ background:'white', borderRadius:16, border:'1px solid var(--border)', ...style }}>{children}</div>
}

const TABS = ['Vue générale','Mes réservations','Mes colis','Négociations','Mon profil']

export default function ClientDashboard() {
  const [tab, setTab] = useState('Vue générale')
  const [offre, setOffre] = useState('')

  return (
    <>
      <Header />
      <div style={{ marginTop:108, background:'var(--gray)', minHeight:'100vh' }}>

        {/* Hero */}
        <div style={{ background:'linear-gradient(135deg, #005C3E 0%, #00875A 100%)', padding:'2.5rem 3rem' }}>
          <div style={{ maxWidth:1280, margin:'0 auto', display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:'1rem' }}>
            <div style={{ display:'flex', alignItems:'center', gap:'1.2rem' }}>
              <div style={{ width:64, height:64, borderRadius:'50%', background:'rgba(255,255,255,0.2)', border:'3px solid rgba(255,255,255,0.4)', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'Bricolage Grotesque,sans-serif', fontWeight:800, fontSize:'1.5rem', color:'white' }}>{user.initials}</div>
              <div>
                <p style={{ color:'rgba(255,255,255,0.7)', fontSize:'0.82rem', marginBottom:2 }}>Espace client 👋</p>
                <h2 style={{ fontFamily:'Bricolage Grotesque,sans-serif', fontWeight:800, fontSize:'1.6rem', color:'white', marginBottom:3 }}>{user.nom}</h2>
                <p style={{ color:'rgba(255,255,255,0.65)', fontSize:'0.82rem' }}>⭐ {user.note} · Membre depuis {user.membre}</p>
              </div>
            </div>
            <Link to="/trajets">
              <button style={{ background:'white', color:'var(--primary)', border:'none', borderRadius:10, padding:'0.8rem 2rem', fontWeight:700, fontSize:'0.95rem', cursor:'pointer', fontFamily:'inherit', boxShadow:'0 4px 16px rgba(0,0,0,0.15)' }}>
                🚗 Trouver un trajet
              </button>
            </Link>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ background:'white', borderBottom:'1px solid var(--border)', position:'sticky', top:108, zIndex:10 }}>
          <div style={{ maxWidth:1280, margin:'0 auto', padding:'0 3rem', display:'flex', gap:0, overflowX:'auto' }}>
            {TABS.map(t => (
              <button key={t} onClick={() => setTab(t)} style={{ padding:'1rem 1.4rem', border:'none', background:'transparent', cursor:'pointer', fontSize:'0.88rem', fontWeight: tab===t ? 700 : 400, color: tab===t ? 'var(--primary)' : 'var(--muted)', borderBottom: tab===t ? '2.5px solid var(--primary)' : '2.5px solid transparent', whiteSpace:'nowrap', fontFamily:'inherit', transition:'all 0.15s' }}>
                {t}
              </button>
            ))}
          </div>
        </div>

        <div style={{ maxWidth:1280, margin:'0 auto', padding:'2.5rem 3rem' }}>

          {/* ── VUE GÉNÉRALE ── */}
          {tab === 'Vue générale' && (
            <div style={{ display:'flex', flexDirection:'column', gap:'1.5rem' }}>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))', gap:'1rem' }}>
                {[['🚗','8','Trajets effectués'],['📦','5','Colis envoyés'],['💬','2','Négociations actives'],['⭐','4.8','Ma note']].map(([ico,val,label]) => (
                  <Card key={label} style={{ padding:'1.5rem', textAlign:'center' }}>
                    <div style={{ fontSize:'1.6rem', marginBottom:'0.6rem' }}>{ico}</div>
                    <div style={{ fontFamily:'Bricolage Grotesque,sans-serif', fontSize:'2rem', fontWeight:800, color:'var(--dark)', lineHeight:1 }}>{val}</div>
                    <div style={{ fontSize:'0.78rem', color:'var(--muted)', marginTop:5 }}>{label}</div>
                  </Card>
                ))}
              </div>

              <Card>
                <div style={{ padding:'1.2rem 1.5rem', borderBottom:'1px solid var(--border)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                  <h3 style={{ fontFamily:'Bricolage Grotesque,sans-serif', fontWeight:700, fontSize:'1rem' }}>Dernières réservations</h3>
                  <button onClick={() => setTab('Mes réservations')} style={{ color:'var(--primary)', fontSize:'0.82rem', fontWeight:600, background:'none', border:'none', cursor:'pointer' }}>Voir tout →</button>
                </div>
                {reservations.slice(0,2).map((r,i) => (
                  <div key={r.id} style={{ padding:'1rem 1.5rem', borderBottom: i<1 ? '1px solid var(--border)' : 'none', display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:'0.5rem' }}>
                    <div>
                      <div style={{ fontWeight:600, color:'var(--dark)', fontSize:'0.95rem' }}>{r.from} → {r.to}</div>
                      <div style={{ fontSize:'0.8rem', color:'var(--muted)', marginTop:2 }}>📅 {r.date} · {r.heure} · {r.conducteur}</div>
                    </div>
                    <div style={{ display:'flex', alignItems:'center', gap:'0.8rem' }}>
                      <span style={{ fontFamily:'Bricolage Grotesque,sans-serif', fontWeight:800 }}>{r.prix}</span>
                      <Badge statut={r.statut} />
                    </div>
                  </div>
                ))}
              </Card>

              <Card>
                <div style={{ padding:'1.2rem 1.5rem', borderBottom:'1px solid var(--border)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                  <h3 style={{ fontFamily:'Bricolage Grotesque,sans-serif', fontWeight:700, fontSize:'1rem' }}>Colis en transit</h3>
                  <button onClick={() => setTab('Mes colis')} style={{ color:'var(--primary)', fontSize:'0.82rem', fontWeight:600, background:'none', border:'none', cursor:'pointer' }}>Voir tout →</button>
                </div>
                {colis.filter(c => c.statut==='en transit').map(c => (
                  <div key={c.id} style={{ padding:'1.2rem 1.5rem', display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:'0.8rem' }}>
                    <div>
                      <div style={{ fontWeight:600, color:'var(--dark)' }}>📦 {c.description} → {c.destination}</div>
                      <div style={{ fontSize:'0.8rem', color:'var(--muted)', marginTop:2 }}>{c.poids} · {c.date}</div>
                    </div>
                    <div style={{ display:'flex', alignItems:'center', gap:'0.8rem' }}>
                      <div style={{ background:'var(--dark)', color:'var(--gold)', padding:'0.4rem 1rem', borderRadius:8, fontFamily:'monospace', fontSize:'1.1rem', fontWeight:800, letterSpacing:4 }}>{c.otp}</div>
                      <Badge statut={c.statut} />
                    </div>
                  </div>
                ))}
              </Card>
            </div>
          )}

          {/* ── MES RÉSERVATIONS ── */}
          {tab === 'Mes réservations' && (
            <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
              <h2 style={{ fontFamily:'Bricolage Grotesque,sans-serif', fontSize:'1.5rem', fontWeight:800, color:'var(--dark)' }}>Mes réservations</h2>
              {reservations.map(r => (
                <Card key={r.id} style={{ padding:'1.5rem', display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:'1rem' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:'1rem' }}>
                    <div style={{ width:48, height:48, background:'var(--primary-light)', borderRadius:12, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.4rem' }}>🚗</div>
                    <div>
                      <div style={{ fontFamily:'Bricolage Grotesque,sans-serif', fontWeight:700, fontSize:'1.05rem', color:'var(--dark)' }}>{r.from} → {r.to}</div>
                      <div style={{ fontSize:'0.82rem', color:'var(--muted)', marginTop:3 }}>📅 {r.date} · ⏰ {r.heure} · {r.conducteur}</div>
                    </div>
                  </div>
                  <div style={{ display:'flex', alignItems:'center', gap:'0.8rem', flexWrap:'wrap' }}>
                    <span style={{ fontFamily:'Bricolage Grotesque,sans-serif', fontSize:'1.2rem', fontWeight:800 }}>{r.prix}</span>
                    <Badge statut={r.statut} />
                    {r.statut==='terminé' && <button style={{ background:'var(--primary-light)', color:'var(--primary)', border:'none', borderRadius:8, padding:'0.4rem 1rem', fontSize:'0.82rem', fontWeight:600, cursor:'pointer', fontFamily:'inherit' }}>⭐ Évaluer</button>}
                    {r.statut==='en attente' && <button style={{ background:'#FFF0ED', color:'#C62828', border:'none', borderRadius:8, padding:'0.4rem 1rem', fontSize:'0.82rem', fontWeight:600, cursor:'pointer', fontFamily:'inherit' }}>✕ Annuler</button>}
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* ── MES COLIS ── */}
          {tab === 'Mes colis' && (
            <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:'1rem' }}>
                <h2 style={{ fontFamily:'Bricolage Grotesque,sans-serif', fontSize:'1.5rem', fontWeight:800, color:'var(--dark)' }}>Mes colis</h2>
                <Link to="/livraison"><button style={{ background:'var(--primary)', color:'white', border:'none', borderRadius:10, padding:'0.7rem 1.5rem', fontWeight:700, fontSize:'0.9rem', cursor:'pointer', fontFamily:'inherit' }}>📦 Envoyer un colis</button></Link>
              </div>
              {colis.map(c => (
                <Card key={c.id} style={{ padding:'1.5rem' }}>
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:'1rem' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:'1rem' }}>
                      <div style={{ width:48, height:48, background:'#FFF0E8', borderRadius:12, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.4rem' }}>📦</div>
                      <div>
                        <div style={{ fontFamily:'Bricolage Grotesque,sans-serif', fontWeight:700, fontSize:'1.05rem', color:'var(--dark)' }}>{c.description} → {c.destination}</div>
                        <div style={{ fontSize:'0.82rem', color:'var(--muted)', marginTop:3 }}>⚖️ {c.poids} · 📅 {c.date}</div>
                      </div>
                    </div>
                    <Badge statut={c.statut} />
                  </div>
                  {c.statut==='en transit' && (
                    <div style={{ marginTop:'1rem', paddingTop:'1rem', borderTop:'1px solid var(--border)', display:'flex', alignItems:'center', gap:'1rem', flexWrap:'wrap' }}>
                      <span style={{ fontSize:'0.82rem', color:'var(--muted)', fontWeight:600 }}>Code OTP destinataire :</span>
                      <div style={{ background:'var(--dark)', color:'var(--gold)', padding:'0.5rem 1.4rem', borderRadius:8, fontFamily:'monospace', fontSize:'1.4rem', fontWeight:800, letterSpacing:6 }}>{c.otp}</div>
                      <span style={{ fontSize:'0.78rem', color:'var(--muted)' }}>🔐 À communiquer uniquement au destinataire</span>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          )}

          {/* ── NÉGOCIATIONS ── */}
          {tab === 'Négociations' && (
            <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
              <h2 style={{ fontFamily:'Bricolage Grotesque,sans-serif', fontSize:'1.5rem', fontWeight:800, color:'var(--dark)' }}>Mes négociations</h2>
              {negociations.map(n => (
                <Card key={n.id} style={{ padding:'1.5rem' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.2rem', flexWrap:'wrap', gap:'0.5rem' }}>
                    <div style={{ fontFamily:'Bricolage Grotesque,sans-serif', fontWeight:700, fontSize:'1.05rem' }}>🚗 {n.trajet}</div>
                    <Badge statut={n.statut} />
                  </div>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem', marginBottom: n.statut==='en cours' ? '1.2rem' : 0 }}>
                    <div style={{ background:'var(--primary-light)', borderRadius:12, padding:'1.2rem', textAlign:'center' }}>
                      <div style={{ fontSize:'0.73rem', color:'var(--primary)', fontWeight:700, marginBottom:6, textTransform:'uppercase', letterSpacing:'0.5px' }}>Mon offre</div>
                      <div style={{ fontFamily:'Bricolage Grotesque,sans-serif', fontSize:'1.6rem', fontWeight:800, color:'var(--primary)' }}>{n.monOffre}</div>
                    </div>
                    <div style={{ background:'var(--gray)', borderRadius:12, padding:'1.2rem', textAlign:'center' }}>
                      <div style={{ fontSize:'0.73rem', color:'var(--muted)', fontWeight:700, marginBottom:6, textTransform:'uppercase', letterSpacing:'0.5px' }}>Offre conducteur</div>
                      <div style={{ fontFamily:'Bricolage Grotesque,sans-serif', fontSize:'1.6rem', fontWeight:800, color:'var(--dark)' }}>{n.offreConducteur}</div>
                    </div>
                  </div>
                  {n.statut==='en cours' && (
                    <div style={{ display:'flex', gap:'0.8rem', flexWrap:'wrap' }}>
                      <input type="number" placeholder="Nouvelle offre (MAD)" value={offre} onChange={e => setOffre(e.target.value)} style={{ flex:1, minWidth:160, padding:'0.75rem 1rem', border:'1.5px solid var(--border)', borderRadius:8, fontSize:'0.92rem', outline:'none', fontFamily:'inherit' }} />
                      <button style={{ background:'var(--primary)', color:'white', border:'none', borderRadius:8, padding:'0.75rem 1.4rem', fontWeight:700, fontSize:'0.88rem', cursor:'pointer', fontFamily:'inherit' }}>Contre-proposer</button>
                      <button style={{ background:'var(--primary-light)', color:'var(--primary)', border:'none', borderRadius:8, padding:'0.75rem 1.2rem', fontWeight:700, fontSize:'0.88rem', cursor:'pointer', fontFamily:'inherit' }}>✓ Accepter</button>
                      <button style={{ background:'#FFF0ED', color:'#C62828', border:'none', borderRadius:8, padding:'0.75rem 1.2rem', fontWeight:700, fontSize:'0.88rem', cursor:'pointer', fontFamily:'inherit' }}>✕ Refuser</button>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          )}

          {/* ── MON PROFIL ── */}
          {tab === 'Mon profil' && (
            <div style={{ maxWidth:600 }}>
              <h2 style={{ fontFamily:'Bricolage Grotesque,sans-serif', fontSize:'1.5rem', fontWeight:800, color:'var(--dark)', marginBottom:'1.5rem' }}>Mon profil</h2>
              <Card style={{ padding:'2rem' }}>
                <div style={{ display:'flex', alignItems:'center', gap:'1.5rem', marginBottom:'2rem', paddingBottom:'2rem', borderBottom:'1px solid var(--border)' }}>
                  <div style={{ width:72, height:72, borderRadius:'50%', background:'linear-gradient(135deg,#00875A,#005C3E)', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'Bricolage Grotesque,sans-serif', fontWeight:800, fontSize:'1.8rem', color:'white' }}>{user.initials}</div>
                  <div>
                    <div style={{ fontFamily:'Bricolage Grotesque,sans-serif', fontWeight:800, fontSize:'1.2rem', color:'var(--dark)' }}>{user.nom}</div>
                    <div style={{ fontSize:'0.82rem', color:'var(--muted)', marginTop:3 }}>⭐ {user.note} · Membre depuis {user.membre}</div>
                    <span style={{ background:'var(--primary-light)', color:'var(--primary)', padding:'0.2rem 0.8rem', borderRadius:20, fontSize:'0.72rem', fontWeight:700, display:'inline-block', marginTop:6 }}>✓ Client vérifié</span>
                  </div>
                </div>
                {[['Nom complet', user.nom, 'text'],['Email', user.email, 'email'],['Téléphone', user.telephone, 'tel']].map(([label, value, type]) => (
                  <div key={label} style={{ marginBottom:'1.2rem' }}>
                    <label style={{ fontSize:'0.75rem', fontWeight:700, color:'var(--muted)', textTransform:'uppercase', letterSpacing:'0.5px', display:'block', marginBottom:'0.4rem' }}>{label}</label>
                    <input type={type} defaultValue={value} style={{ width:'100%', padding:'0.85rem 1rem', border:'1.5px solid var(--border)', borderRadius:10, fontSize:'0.92rem', outline:'none', fontFamily:'inherit', background:'var(--gray)' }} />
                  </div>
                ))}
                <button style={{ width:'100%', padding:'1rem', background:'var(--primary)', color:'white', border:'none', borderRadius:10, fontSize:'1rem', fontWeight:700, cursor:'pointer', fontFamily:'inherit', marginTop:'0.5rem' }}>
                  Sauvegarder les modifications
                </button>
              </Card>
            </div>
          )}

        </div>
      </div>
      <Footer />
    </>
  )
}