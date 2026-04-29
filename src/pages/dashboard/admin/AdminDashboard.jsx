import { useState } from 'react'
import Header from '../../../components/layout/Header'
import Footer from '../../../components/layout/Footer'

const stats = [
  { ico:'👥', val:'12 847', label:'Utilisateurs total' },
  { ico:'🚗', val:'856', label:'Conducteurs actifs' },
  { ico:'📋', val:'23', label:'Docs en attente' },
  { ico:'⚠️', val:'5', label:'Litiges ouverts' },
  { ico:'💰', val:'284 600', label:'Volume (MAD)' },
  { ico:'⭐', val:'4.7', label:'Note plateforme' },
]

const documents = [
  { id:1, nom:'Omar Lahlou', type:'Permis de conduire', date:'28 Avr 2026', statut:'en attente' },
  { id:2, nom:'Fatima Zahra', type:'Carte d\'identité', date:'27 Avr 2026', statut:'en attente' },
  { id:3, nom:'Rachid Benmoussa', type:'Carte grise', date:'26 Avr 2026', statut:'rejeté' },
]

const utilisateurs = [
  { id:1, nom:'Hamid Moussaoui', email:'hamid.m@gmail.com', role:'Client', trajets:8, statut:'actif', date:'Jan 2025' },
  { id:2, nom:'Youssef Amrani', email:'youssef.a@gmail.com', role:'Conducteur', trajets:42, statut:'actif', date:'Mar 2024' },
  { id:3, nom:'Sara Benali', email:'sara.b@gmail.com', role:'Client', trajets:3, statut:'bloqué', date:'Fév 2025' },
]

const litiges = [
  { id:1, type:'Colis non livré', client:'Hamid M.', conducteur:'Karim F.', date:'27 Avr 2026', statut:'ouvert' },
  { id:2, type:'Prix non respecté', client:'Nadia B.', conducteur:'Omar L.', date:'25 Avr 2026', statut:'en cours' },
]

const COLORS = {
  'en attente': { bg:'#FFF8E6', color:'#92610A' },
  'rejeté':     { bg:'#FDEDED', color:'#C62828' },
  'validé':     { bg:'#E8F5F0', color:'#005C3E' },
  'actif':      { bg:'#E8F5F0', color:'#005C3E' },
  'bloqué':     { bg:'#FDEDED', color:'#C62828' },
  'ouvert':     { bg:'#FDEDED', color:'#C62828' },
  'en cours':   { bg:'#FFF8E6', color:'#92610A' },
  'résolu':     { bg:'#E8F5F0', color:'#005C3E' },
}

function Badge({ statut }) {
  const s = COLORS[statut] || { bg:'#eee', color:'#555' }
  return <span style={{ ...s, padding:'0.3rem 0.9rem', borderRadius:20, fontSize:'0.75rem', fontWeight:700 }}>{statut}</span>
}

function Card({ children, style }) {
  return <div style={{ background:'white', borderRadius:16, border:'1px solid var(--border)', ...style }}>{children}</div>
}

const TABS = ['Vue générale','Documents','Utilisateurs','Litiges','Statistiques']

export default function AdminDashboard() {
  const [tab, setTab] = useState('Vue générale')

  return (
    <>
      <Header />
      <div style={{ marginTop:108, background:'var(--gray)', minHeight:'100vh' }}>

        {/* Hero */}
        <div style={{ background:'linear-gradient(135deg, #1a0533 0%, #2d1054 100%)', padding:'2.5rem 3rem' }}>
          <div style={{ maxWidth:1280, margin:'0 auto', display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:'1rem' }}>
            <div style={{ display:'flex', alignItems:'center', gap:'1.2rem' }}>
              <div style={{ width:64, height:64, borderRadius:'50%', background:'rgba(255,255,255,0.15)', border:'3px solid rgba(255,255,255,0.3)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.8rem' }}>⚙️</div>
              <div>
                <p style={{ color:'rgba(255,255,255,0.6)', fontSize:'0.82rem', marginBottom:2 }}>Back-office admin</p>
                <h2 style={{ fontFamily:'Bricolage Grotesque,sans-serif', fontWeight:800, fontSize:'1.6rem', color:'white', marginBottom:3 }}>Tableau de bord</h2>
                <p style={{ color:'rgba(255,255,255,0.5)', fontSize:'0.82rem' }}>Université Sultan Moulay Slimane · CovoitGo</p>
              </div>
            </div>
            <div style={{ display:'flex', gap:'0.8rem', flexWrap:'wrap' }}>
              <span style={{ background:'rgba(255,255,255,0.1)', color:'white', padding:'0.5rem 1rem', borderRadius:8, fontSize:'0.82rem', fontWeight:600 }}>🟢 Système opérationnel</span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ background:'white', borderBottom:'1px solid var(--border)', position:'sticky', top:108, zIndex:10 }}>
          <div style={{ maxWidth:1280, margin:'0 auto', padding:'0 3rem', display:'flex', overflowX:'auto' }}>
            {TABS.map(t => (
              <button key={t} onClick={() => setTab(t)} style={{ padding:'1rem 1.3rem', border:'none', background:'transparent', cursor:'pointer', fontSize:'0.88rem', fontWeight: tab===t ? 700 : 400, color: tab===t ? 'var(--primary)' : 'var(--muted)', borderBottom: tab===t ? '2.5px solid var(--primary)' : '2.5px solid transparent', whiteSpace:'nowrap', fontFamily:'inherit' }}>
                {t}
              </button>
            ))}
          </div>
        </div>

        <div style={{ maxWidth:1280, margin:'0 auto', padding:'2.5rem 3rem' }}>

          {/* VUE GÉNÉRALE */}
          {tab === 'Vue générale' && (
            <div style={{ display:'flex', flexDirection:'column', gap:'1.5rem' }}>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))', gap:'1rem' }}>
                {stats.map(s => (
                  <Card key={s.label} style={{ padding:'1.5rem', textAlign:'center' }}>
                    <div style={{ fontSize:'1.6rem', marginBottom:'0.6rem' }}>{s.ico}</div>
                    <div style={{ fontFamily:'Bricolage Grotesque,sans-serif', fontSize:'1.5rem', fontWeight:800, color:'var(--dark)', lineHeight:1 }}>{s.val}</div>
                    <div style={{ fontSize:'0.75rem', color:'var(--muted)', marginTop:5 }}>{s.label}</div>
                  </Card>
                ))}
              </div>

              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1.5rem' }}>
                <Card>
                  <div style={{ padding:'1.2rem 1.5rem', borderBottom:'1px solid var(--border)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                    <h3 style={{ fontFamily:'Bricolage Grotesque,sans-serif', fontWeight:700, fontSize:'1rem' }}>📋 Documents à valider</h3>
                    <button onClick={() => setTab('Documents')} style={{ color:'var(--primary)', fontSize:'0.82rem', fontWeight:600, background:'none', border:'none', cursor:'pointer' }}>Voir tout →</button>
                  </div>
                  {documents.filter(d => d.statut==='en attente').map((d,i,arr) => (
                    <div key={d.id} style={{ padding:'0.9rem 1.5rem', borderBottom: i<arr.length-1 ? '1px solid var(--border)' : 'none', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                      <div>
                        <div style={{ fontWeight:600, fontSize:'0.88rem', color:'var(--dark)' }}>{d.nom}</div>
                        <div style={{ fontSize:'0.78rem', color:'var(--muted)', marginTop:1 }}>{d.type}</div>
                      </div>
                      <Badge statut={d.statut} />
                    </div>
                  ))}
                </Card>

                <Card>
                  <div style={{ padding:'1.2rem 1.5rem', borderBottom:'1px solid var(--border)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                    <h3 style={{ fontFamily:'Bricolage Grotesque,sans-serif', fontWeight:700, fontSize:'1rem' }}>⚠️ Litiges ouverts</h3>
                    <button onClick={() => setTab('Litiges')} style={{ color:'var(--primary)', fontSize:'0.82rem', fontWeight:600, background:'none', border:'none', cursor:'pointer' }}>Voir tout →</button>
                  </div>
                  {litiges.map((l,i,arr) => (
                    <div key={l.id} style={{ padding:'0.9rem 1.5rem', borderBottom: i<arr.length-1 ? '1px solid var(--border)' : 'none', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                      <div>
                        <div style={{ fontWeight:600, fontSize:'0.88rem', color:'var(--dark)' }}>{l.type}</div>
                        <div style={{ fontSize:'0.78rem', color:'var(--muted)', marginTop:1 }}>{l.client} vs {l.conducteur}</div>
                      </div>
                      <Badge statut={l.statut} />
                    </div>
                  ))}
                </Card>
              </div>
            </div>
          )}

          {/* DOCUMENTS */}
          {tab === 'Documents' && (
            <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
              <h2 style={{ fontFamily:'Bricolage Grotesque,sans-serif', fontSize:'1.5rem', fontWeight:800, color:'var(--dark)' }}>Validation des documents</h2>
              {documents.map(d => (
                <Card key={d.id} style={{ padding:'1.5rem', display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:'1rem' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:'1rem' }}>
                    <div style={{ width:48, height:48, background:'#F3EEFF', borderRadius:12, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.4rem' }}>📄</div>
                    <div>
                      <div style={{ fontFamily:'Bricolage Grotesque,sans-serif', fontWeight:700, fontSize:'1.05rem', color:'var(--dark)' }}>{d.nom}</div>
                      <div style={{ fontSize:'0.82rem', color:'var(--muted)', marginTop:3 }}>{d.type} · 📅 {d.date}</div>
                    </div>
                  </div>
                  <div style={{ display:'flex', alignItems:'center', gap:'0.8rem', flexWrap:'wrap' }}>
                    <Badge statut={d.statut} />
                    {d.statut === 'en attente' && (
                      <>
                        <button style={{ background:'var(--primary-light)', color:'var(--primary)', border:'none', borderRadius:8, padding:'0.5rem 1.2rem', fontSize:'0.85rem', fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}>✓ Valider</button>
                        <button style={{ background:'#FDEDED', color:'#C62828', border:'none', borderRadius:8, padding:'0.5rem 1.2rem', fontSize:'0.85rem', fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}>✕ Rejeter</button>
                      </>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* UTILISATEURS */}
          {tab === 'Utilisateurs' && (
            <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:'1rem' }}>
                <h2 style={{ fontFamily:'Bricolage Grotesque,sans-serif', fontSize:'1.5rem', fontWeight:800, color:'var(--dark)' }}>Gestion des utilisateurs</h2>
                <input placeholder="🔍 Rechercher un utilisateur..." style={{ padding:'0.7rem 1rem', border:'1.5px solid var(--border)', borderRadius:8, fontSize:'0.88rem', outline:'none', fontFamily:'inherit', minWidth:260 }} />
              </div>
              {utilisateurs.map(u => (
                <Card key={u.id} style={{ padding:'1.5rem', display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:'1rem' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:'1rem' }}>
                    <div style={{ width:44, height:44, borderRadius:'50%', background: u.role==='Conducteur' ? 'var(--dark)' : 'var(--primary-light)', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, fontSize:'0.85rem', color: u.role==='Conducteur' ? 'white' : 'var(--primary)' }}>
                      {u.nom.split(' ').map(n=>n[0]).join('')}
                    </div>
                    <div>
                      <div style={{ fontWeight:700, color:'var(--dark)', fontSize:'0.95rem' }}>{u.nom}</div>
                      <div style={{ fontSize:'0.8rem', color:'var(--muted)', marginTop:2 }}>{u.email} · {u.role} · {u.trajets} trajets · Inscrit {u.date}</div>
                    </div>
                  </div>
                  <div style={{ display:'flex', alignItems:'center', gap:'0.8rem', flexWrap:'wrap' }}>
                    <Badge statut={u.statut} />
                    {u.statut==='actif'
                      ? <button style={{ background:'#FDEDED', color:'#C62828', border:'none', borderRadius:8, padding:'0.4rem 1rem', fontSize:'0.82rem', fontWeight:600, cursor:'pointer', fontFamily:'inherit' }}>🔒 Bloquer</button>
                      : <button style={{ background:'var(--primary-light)', color:'var(--primary)', border:'none', borderRadius:8, padding:'0.4rem 1rem', fontSize:'0.82rem', fontWeight:600, cursor:'pointer', fontFamily:'inherit' }}>🔓 Débloquer</button>
                    }
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* LITIGES */}
          {tab === 'Litiges' && (
            <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
              <h2 style={{ fontFamily:'Bricolage Grotesque,sans-serif', fontSize:'1.5rem', fontWeight:800, color:'var(--dark)' }}>Gestion des litiges</h2>
              {litiges.map(l => (
                <Card key={l.id} style={{ padding:'1.5rem' }}>
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'1rem', flexWrap:'wrap', gap:'0.5rem' }}>
                    <div style={{ fontFamily:'Bricolage Grotesque,sans-serif', fontWeight:700, fontSize:'1.05rem', color:'var(--dark)' }}>⚠️ {l.type}</div>
                    <Badge statut={l.statut} />
                  </div>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem', marginBottom:'1rem' }}>
                    <div style={{ background:'var(--gray)', borderRadius:10, padding:'1rem' }}>
                      <div style={{ fontSize:'0.73rem', color:'var(--muted)', fontWeight:700, marginBottom:4, textTransform:'uppercase' }}>Client</div>
                      <div style={{ fontWeight:600, color:'var(--dark)' }}>👤 {l.client}</div>
                    </div>
                    <div style={{ background:'var(--gray)', borderRadius:10, padding:'1rem' }}>
                      <div style={{ fontSize:'0.73rem', color:'var(--muted)', fontWeight:700, marginBottom:4, textTransform:'uppercase' }}>Conducteur</div>
                      <div style={{ fontWeight:600, color:'var(--dark)' }}>🚗 {l.conducteur}</div>
                    </div>
                  </div>
                  <div style={{ display:'flex', gap:'0.8rem', flexWrap:'wrap' }}>
                    <button style={{ background:'var(--primary-light)', color:'var(--primary)', border:'none', borderRadius:8, padding:'0.6rem 1.3rem', fontSize:'0.85rem', fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}>✓ Marquer résolu</button>
                    <button style={{ background:'var(--gray)', color:'var(--dark)', border:'none', borderRadius:8, padding:'0.6rem 1.3rem', fontSize:'0.85rem', fontWeight:600, cursor:'pointer', fontFamily:'inherit' }}>📧 Contacter les parties</button>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* STATISTIQUES */}
          {tab === 'Statistiques' && (
            <div style={{ display:'flex', flexDirection:'column', gap:'1.5rem' }}>
              <h2 style={{ fontFamily:'Bricolage Grotesque,sans-serif', fontSize:'1.5rem', fontWeight:800, color:'var(--dark)' }}>Statistiques plateforme</h2>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))', gap:'1rem' }}>
                {[['Avril 2026','2 847 MAD','Revenus du mois'],['Cette semaine','342','Nouveaux trajets'],['Ce mois','1 284','Nouvelles inscriptions'],['Taux satisfaction','94%','Évaluations positives']].map(([periode,val,label]) => (
                  <Card key={label} style={{ padding:'1.5rem' }}>
                    <div style={{ fontSize:'0.75rem', color:'var(--muted)', fontWeight:600, marginBottom:6, textTransform:'uppercase' }}>{periode}</div>
                    <div style={{ fontFamily:'Bricolage Grotesque,sans-serif', fontSize:'1.8rem', fontWeight:800, color:'var(--dark)', lineHeight:1, marginBottom:4 }}>{val}</div>
                    <div style={{ fontSize:'0.82rem', color:'var(--muted)' }}>{label}</div>
                  </Card>
                ))}
              </div>
              <Card style={{ padding:'1.5rem' }}>
                <h3 style={{ fontFamily:'Bricolage Grotesque,sans-serif', fontWeight:700, marginBottom:'1.2rem' }}>Répartition par ville</h3>
                {[['Béni Mellal','42%',42],['Casablanca','28%',28],['Marrakech','18%',18],['Rabat','12%',12]].map(([ville,pct,w]) => (
                  <div key={ville} style={{ marginBottom:'0.9rem' }}>
                    <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
                      <span style={{ fontSize:'0.88rem', fontWeight:600, color:'var(--dark)' }}>{ville}</span>
                      <span style={{ fontSize:'0.82rem', color:'var(--muted)', fontWeight:600 }}>{pct}</span>
                    </div>
                    <div style={{ background:'var(--gray2)', borderRadius:20, height:8 }}>
                      <div style={{ background:'var(--primary)', borderRadius:20, height:8, width:`${w}%`, transition:'width 0.5s' }} />
                    </div>
                  </div>
                ))}
              </Card>
            </div>
          )}

        </div>
      </div>
      <Footer />
    </>
  )
}