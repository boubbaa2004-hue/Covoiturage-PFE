import { useState } from 'react'
import Header from '../../../components/layout/Header'
import Footer from '../../../components/layout/Footer'

const conducteur = { nom:'Youssef Amrani', initials:'YA', note:4.9, trajets:42, revenus:'8 640 MAD', membre:'Mars 2024', verifie:true }

const mesTrajets = [
  { id:1, from:'Béni Mellal', to:'Casablanca', date:'29 Avril 2026', heure:'08:00', places:3, placesDispos:1, prix:'80 MAD', statut:'actif' },
  { id:2, from:'Casablanca', to:'Béni Mellal', date:'30 Avril 2026', heure:'17:00', places:4, placesDispos:4, prix:'80 MAD', statut:'actif' },
  { id:3, from:'Béni Mellal', to:'Marrakech', date:'15 Avril 2026', heure:'09:00', places:3, placesDispos:0, prix:'70 MAD', statut:'terminé' },
]

const demandes = [
  { id:1, client:'Hamid M.', trajet:'Béni Mellal → Casa', date:'29 Avril 2026', places:1, offre:'70 MAD', prixAffiche:'80 MAD', statut:'négociation' },
  { id:2, client:'Nadia B.', trajet:'Béni Mellal → Casa', date:'29 Avril 2026', places:2, offre:'80 MAD', prixAffiche:'80 MAD', statut:'en attente' },
]

const livraisons = [
  { id:1, expediteur:'Karim F.', description:'Documents', destination:'Casablanca', poids:'0.5 kg', statut:'en transit', date:'28 Avril 2026' },
  { id:2, expediteur:'Sara B.', description:'Vêtements', destination:'Casablanca', poids:'2 kg', statut:'livré', date:'20 Avril 2026' },
]

const COLORS = {
  'actif':       { bg:'#E8F5F0', color:'#005C3E' },
  'terminé':     { bg:'#F1F1F1', color:'#555' },
  'négociation': { bg:'#FFF8E6', color:'#92610A' },
  'en attente':  { bg:'#E6F1FB', color:'#185FA5' },
  'en transit':  { bg:'#E6F1FB', color:'#185FA5' },
  'livré':       { bg:'#E8F5F0', color:'#005C3E' },
}

function Badge({ statut }) {
  const s = COLORS[statut] || { bg:'#eee', color:'#555' }
  return <span style={{ ...s, padding:'0.3rem 0.9rem', borderRadius:20, fontSize:'0.75rem', fontWeight:700 }}>{statut}</span>
}

function Card({ children, style }) {
  return <div style={{ background:'white', borderRadius:16, border:'1px solid var(--border)', ...style }}>{children}</div>
}

const TABS = ['Vue générale','Mes trajets','Demandes','Livraisons','Revenus','Mon profil']

export default function ConducteurDashboard() {
  const [tab, setTab] = useState('Vue générale')
  const [contre, setContre] = useState('')
  const [showForm, setShowForm] = useState(false)

  return (
    <>
      <Header />
      <div style={{ marginTop:108, background:'var(--gray)', minHeight:'100vh' }}>

        {/* Hero */}
        <div style={{ background:'linear-gradient(135deg, #0D1117 0%, #1C2434 100%)', padding:'2.5rem 3rem' }}>
          <div style={{ maxWidth:1280, margin:'0 auto', display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:'1rem' }}>
            <div style={{ display:'flex', alignItems:'center', gap:'1.2rem' }}>
              <div style={{ width:64, height:64, borderRadius:'50%', background:'var(--primary)', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'Bricolage Grotesque,sans-serif', fontWeight:800, fontSize:'1.5rem', color:'white', border:'3px solid rgba(255,255,255,0.2)' }}>{conducteur.initials}</div>
              <div>
                <div style={{ display:'flex', alignItems:'center', gap:'0.6rem', marginBottom:4 }}>
                  <p style={{ color:'rgba(255,255,255,0.6)', fontSize:'0.82rem' }}>Espace conducteur 🚗</p>
                  {conducteur.verifie && <span style={{ background:'var(--primary)', color:'white', padding:'0.15rem 0.6rem', borderRadius:20, fontSize:'0.7rem', fontWeight:700 }}>✓ Vérifié</span>}
                </div>
                <h2 style={{ fontFamily:'Bricolage Grotesque,sans-serif', fontWeight:800, fontSize:'1.6rem', color:'white', marginBottom:3 }}>{conducteur.nom}</h2>
                <p style={{ color:'rgba(255,255,255,0.55)', fontSize:'0.82rem' }}>⭐ {conducteur.note} · {conducteur.trajets} trajets · Membre depuis {conducteur.membre}</p>
              </div>
            </div>
            <button onClick={() => setShowForm(true)} style={{ background:'var(--primary)', color:'white', border:'none', borderRadius:10, padding:'0.8rem 2rem', fontWeight:700, fontSize:'0.95rem', cursor:'pointer', fontFamily:'inherit' }}>
              + Publier un trajet
            </button>
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

          {/* Modal publier trajet */}
          {showForm && (
            <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center', padding:'1rem' }}>
              <Card style={{ padding:'2rem', width:'100%', maxWidth:500, maxHeight:'90vh', overflowY:'auto' }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.5rem' }}>
                  <h3 style={{ fontFamily:'Bricolage Grotesque,sans-serif', fontWeight:800, fontSize:'1.2rem' }}>Publier un trajet</h3>
                  <button onClick={() => setShowForm(false)} style={{ background:'none', border:'none', fontSize:'1.3rem', cursor:'pointer', color:'var(--muted)' }}>✕</button>
                </div>
                {[['Ville de départ','text','Ex: Béni Mellal'],['Ville d\'arrivée','text','Ex: Casablanca'],['Date','date',''],['Heure de départ','time',''],['Nombre de places','number','4'],['Prix par place (MAD)','number','80'],['Volume coffre (kg)','number','20']].map(([label,type,placeholder]) => (
                  <div key={label} style={{ marginBottom:'1rem' }}>
                    <label style={{ fontSize:'0.75rem', fontWeight:700, color:'var(--muted)', textTransform:'uppercase', letterSpacing:'0.5px', display:'block', marginBottom:'0.4rem' }}>{label}</label>
                    <input type={type} placeholder={placeholder} style={{ width:'100%', padding:'0.8rem 1rem', border:'1.5px solid var(--border)', borderRadius:8, fontSize:'0.92rem', outline:'none', fontFamily:'inherit' }} />
                  </div>
                ))}
                <button style={{ width:'100%', padding:'1rem', background:'var(--primary)', color:'white', border:'none', borderRadius:10, fontSize:'1rem', fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}>Publier le trajet</button>
              </Card>
            </div>
          )}

          {/* VUE GÉNÉRALE */}
          {tab === 'Vue générale' && (
            <div style={{ display:'flex', flexDirection:'column', gap:'1.5rem' }}>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))', gap:'1rem' }}>
                {[['🚗','42','Trajets effectués'],['👥','186','Passagers transportés'],['📦','28','Colis livrés'],['⭐','4.9','Ma note'],['💰','8 640','Revenus (MAD)']].map(([ico,val,label]) => (
                  <Card key={label} style={{ padding:'1.5rem', textAlign:'center' }}>
                    <div style={{ fontSize:'1.6rem', marginBottom:'0.6rem' }}>{ico}</div>
                    <div style={{ fontFamily:'Bricolage Grotesque,sans-serif', fontSize:'1.7rem', fontWeight:800, color:'var(--dark)', lineHeight:1 }}>{val}</div>
                    <div style={{ fontSize:'0.78rem', color:'var(--muted)', marginTop:5 }}>{label}</div>
                  </Card>
                ))}
              </div>

              <Card>
                <div style={{ padding:'1.2rem 1.5rem', borderBottom:'1px solid var(--border)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                  <h3 style={{ fontFamily:'Bricolage Grotesque,sans-serif', fontWeight:700, fontSize:'1rem' }}>Demandes en attente</h3>
                  <button onClick={() => setTab('Demandes')} style={{ color:'var(--primary)', fontSize:'0.82rem', fontWeight:600, background:'none', border:'none', cursor:'pointer' }}>Voir tout →</button>
                </div>
                {demandes.map((d,i) => (
                  <div key={d.id} style={{ padding:'1rem 1.5rem', borderBottom: i<demandes.length-1 ? '1px solid var(--border)' : 'none', display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:'0.5rem' }}>
                    <div>
                      <div style={{ fontWeight:600, color:'var(--dark)' }}>{d.client} · {d.trajet}</div>
                      <div style={{ fontSize:'0.8rem', color:'var(--muted)', marginTop:2 }}>📅 {d.date} · {d.places} place(s) · Offre : {d.offre}</div>
                    </div>
                    <div style={{ display:'flex', gap:'0.6rem', flexWrap:'wrap' }}>
                      <Badge statut={d.statut} />
                      <button style={{ background:'var(--primary-light)', color:'var(--primary)', border:'none', borderRadius:8, padding:'0.3rem 0.9rem', fontSize:'0.8rem', fontWeight:600, cursor:'pointer', fontFamily:'inherit' }}>✓ Accepter</button>
                      <button style={{ background:'#FFF0ED', color:'#C62828', border:'none', borderRadius:8, padding:'0.3rem 0.9rem', fontSize:'0.8rem', fontWeight:600, cursor:'pointer', fontFamily:'inherit' }}>✕ Refuser</button>
                    </div>
                  </div>
                ))}
              </Card>
            </div>
          )}

          {/* MES TRAJETS */}
          {tab === 'Mes trajets' && (
            <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:'1rem' }}>
                <h2 style={{ fontFamily:'Bricolage Grotesque,sans-serif', fontSize:'1.5rem', fontWeight:800, color:'var(--dark)' }}>Mes trajets publiés</h2>
                <button onClick={() => setShowForm(true)} style={{ background:'var(--primary)', color:'white', border:'none', borderRadius:10, padding:'0.7rem 1.5rem', fontWeight:700, fontSize:'0.9rem', cursor:'pointer', fontFamily:'inherit' }}>+ Nouveau trajet</button>
              </div>
              {mesTrajets.map(t => (
                <Card key={t.id} style={{ padding:'1.5rem', display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:'1rem' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:'1rem' }}>
                    <div style={{ width:48, height:48, background:'var(--primary-light)', borderRadius:12, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.4rem' }}>🚗</div>
                    <div>
                      <div style={{ fontFamily:'Bricolage Grotesque,sans-serif', fontWeight:700, fontSize:'1.05rem', color:'var(--dark)' }}>{t.from} → {t.to}</div>
                      <div style={{ fontSize:'0.82rem', color:'var(--muted)', marginTop:3 }}>📅 {t.date} · ⏰ {t.heure} · 💺 {t.placesDispos}/{t.places} places dispo</div>
                    </div>
                  </div>
                  <div style={{ display:'flex', alignItems:'center', gap:'0.8rem', flexWrap:'wrap' }}>
                    <span style={{ fontFamily:'Bricolage Grotesque,sans-serif', fontSize:'1.2rem', fontWeight:800 }}>{t.prix}</span>
                    <Badge statut={t.statut} />
                    {t.statut==='actif' && <button style={{ background:'var(--gray)', color:'var(--muted)', border:'none', borderRadius:8, padding:'0.4rem 1rem', fontSize:'0.82rem', fontWeight:600, cursor:'pointer', fontFamily:'inherit' }}>✏️ Modifier</button>}
                    {t.statut==='actif' && <button style={{ background:'#FFF0ED', color:'#C62828', border:'none', borderRadius:8, padding:'0.4rem 1rem', fontSize:'0.82rem', fontWeight:600, cursor:'pointer', fontFamily:'inherit' }}>Annuler</button>}
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* DEMANDES */}
          {tab === 'Demandes' && (
            <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
              <h2 style={{ fontFamily:'Bricolage Grotesque,sans-serif', fontSize:'1.5rem', fontWeight:800, color:'var(--dark)' }}>Demandes de réservation</h2>
              {demandes.map(d => (
                <Card key={d.id} style={{ padding:'1.5rem' }}>
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'1rem', flexWrap:'wrap', gap:'0.5rem' }}>
                    <div>
                      <div style={{ fontFamily:'Bricolage Grotesque,sans-serif', fontWeight:700, fontSize:'1.05rem', color:'var(--dark)' }}>👤 {d.client}</div>
                      <div style={{ fontSize:'0.82rem', color:'var(--muted)', marginTop:3 }}>🚗 {d.trajet} · 📅 {d.date} · 💺 {d.places} place(s)</div>
                    </div>
                    <Badge statut={d.statut} />
                  </div>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem', marginBottom:'1rem' }}>
                    <div style={{ background:'var(--gray)', borderRadius:10, padding:'1rem', textAlign:'center' }}>
                      <div style={{ fontSize:'0.73rem', color:'var(--muted)', fontWeight:700, marginBottom:4, textTransform:'uppercase' }}>Prix affiché</div>
                      <div style={{ fontFamily:'Bricolage Grotesque,sans-serif', fontSize:'1.4rem', fontWeight:800, color:'var(--dark)' }}>{d.prixAffiche}</div>
                    </div>
                    <div style={{ background: d.statut==='négociation' ? 'var(--primary-light)' : 'var(--gray)', borderRadius:10, padding:'1rem', textAlign:'center' }}>
                      <div style={{ fontSize:'0.73rem', color: d.statut==='négociation' ? 'var(--primary)' : 'var(--muted)', fontWeight:700, marginBottom:4, textTransform:'uppercase' }}>Offre client</div>
                      <div style={{ fontFamily:'Bricolage Grotesque,sans-serif', fontSize:'1.4rem', fontWeight:800, color: d.statut==='négociation' ? 'var(--primary)' : 'var(--dark)' }}>{d.offre}</div>
                    </div>
                  </div>
                  <div style={{ display:'flex', gap:'0.8rem', flexWrap:'wrap' }}>
                    <button style={{ background:'var(--primary-light)', color:'var(--primary)', border:'none', borderRadius:8, padding:'0.7rem 1.4rem', fontWeight:700, fontSize:'0.88rem', cursor:'pointer', fontFamily:'inherit' }}>✓ Accepter</button>
                    {d.statut==='négociation' && (
                      <>
                        <input type="number" placeholder="Contre-offre (MAD)" value={contre} onChange={e => setContre(e.target.value)} style={{ flex:1, minWidth:150, padding:'0.7rem 1rem', border:'1.5px solid var(--border)', borderRadius:8, fontSize:'0.92rem', outline:'none', fontFamily:'inherit' }} />
                        <button style={{ background:'var(--dark)', color:'white', border:'none', borderRadius:8, padding:'0.7rem 1.3rem', fontWeight:700, fontSize:'0.88rem', cursor:'pointer', fontFamily:'inherit' }}>Contre-proposer</button>
                      </>
                    )}
                    <button style={{ background:'#FFF0ED', color:'#C62828', border:'none', borderRadius:8, padding:'0.7rem 1.2rem', fontWeight:700, fontSize:'0.88rem', cursor:'pointer', fontFamily:'inherit' }}>✕ Refuser</button>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* LIVRAISONS */}
          {tab === 'Livraisons' && (
            <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
              <h2 style={{ fontFamily:'Bricolage Grotesque,sans-serif', fontSize:'1.5rem', fontWeight:800, color:'var(--dark)' }}>Livraisons de colis</h2>
              {livraisons.map(l => (
                <Card key={l.id} style={{ padding:'1.5rem' }}>
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:'1rem' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:'1rem' }}>
                      <div style={{ width:48, height:48, background:'#FFF0E8', borderRadius:12, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.4rem' }}>📦</div>
                      <div>
                        <div style={{ fontFamily:'Bricolage Grotesque,sans-serif', fontWeight:700, fontSize:'1.05rem', color:'var(--dark)' }}>{l.description} → {l.destination}</div>
                        <div style={{ fontSize:'0.82rem', color:'var(--muted)', marginTop:3 }}>👤 {l.expediteur} · ⚖️ {l.poids} · 📅 {l.date}</div>
                      </div>
                    </div>
                    <div style={{ display:'flex', alignItems:'center', gap:'0.8rem', flexWrap:'wrap' }}>
                      <Badge statut={l.statut} />
                      {l.statut==='en transit' && (
                        <button style={{ background:'var(--primary)', color:'white', border:'none', borderRadius:8, padding:'0.5rem 1.2rem', fontSize:'0.85rem', fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}>
                          🔐 Valider OTP
                        </button>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* REVENUS */}
          {tab === 'Revenus' && (
            <div style={{ display:'flex', flexDirection:'column', gap:'1.5rem' }}>
              <h2 style={{ fontFamily:'Bricolage Grotesque,sans-serif', fontSize:'1.5rem', fontWeight:800, color:'var(--dark)' }}>Mes revenus</h2>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))', gap:'1rem' }}>
                {[['💰','8 640 MAD','Total revenus'],['📅','1 920 MAD','Ce mois'],['🚗','3 360 MAD','Covoiturage'],['📦','480 MAD','Livraisons']].map(([ico,val,label]) => (
                  <Card key={label} style={{ padding:'1.5rem', textAlign:'center' }}>
                    <div style={{ fontSize:'1.6rem', marginBottom:'0.6rem' }}>{ico}</div>
                    <div style={{ fontFamily:'Bricolage Grotesque,sans-serif', fontSize:'1.4rem', fontWeight:800, color:'var(--dark)', lineHeight:1 }}>{val}</div>
                    <div style={{ fontSize:'0.78rem', color:'var(--muted)', marginTop:5 }}>{label}</div>
                  </Card>
                ))}
              </div>
              <Card>
                <div style={{ padding:'1.2rem 1.5rem', borderBottom:'1px solid var(--border)' }}>
                  <h3 style={{ fontFamily:'Bricolage Grotesque,sans-serif', fontWeight:700, fontSize:'1rem' }}>Historique des paiements</h3>
                </div>
                {[
                  { date:'29 Avr 2026', trajet:'Béni Mellal → Casa', passager:'Hamid M.', montant:'+80 MAD' },
                  { date:'27 Avr 2026', trajet:'Colis - Casa', passager:'Karim F.', montant:'+40 MAD' },
                  { date:'25 Avr 2026', trajet:'Casa → Béni Mellal', passager:'Nadia B.', montant:'+160 MAD' },
                ].map((p,i,arr) => (
                  <div key={i} style={{ padding:'1rem 1.5rem', borderBottom: i<arr.length-1 ? '1px solid var(--border)' : 'none', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                    <div>
                      <div style={{ fontWeight:600, color:'var(--dark)', fontSize:'0.92rem' }}>{p.trajet}</div>
                      <div style={{ fontSize:'0.8rem', color:'var(--muted)', marginTop:2 }}>📅 {p.date} · {p.passager}</div>
                    </div>
                    <span style={{ fontFamily:'Bricolage Grotesque,sans-serif', fontWeight:800, color:'var(--primary)', fontSize:'1.1rem' }}>{p.montant}</span>
                  </div>
                ))}
              </Card>
            </div>
          )}

          {/* MON PROFIL */}
          {tab === 'Mon profil' && (
            <div style={{ maxWidth:600 }}>
              <h2 style={{ fontFamily:'Bricolage Grotesque,sans-serif', fontSize:'1.5rem', fontWeight:800, color:'var(--dark)', marginBottom:'1.5rem' }}>Mon profil conducteur</h2>
              <Card style={{ padding:'2rem', marginBottom:'1rem' }}>
                <div style={{ display:'flex', alignItems:'center', gap:'1.5rem', marginBottom:'2rem', paddingBottom:'2rem', borderBottom:'1px solid var(--border)' }}>
                  <div style={{ width:72, height:72, borderRadius:'50%', background:'var(--dark)', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'Bricolage Grotesque,sans-serif', fontWeight:800, fontSize:'1.8rem', color:'white' }}>{conducteur.initials}</div>
                  <div>
                    <div style={{ fontFamily:'Bricolage Grotesque,sans-serif', fontWeight:800, fontSize:'1.2rem', color:'var(--dark)' }}>{conducteur.nom}</div>
                    <div style={{ fontSize:'0.82rem', color:'var(--muted)', marginTop:3 }}>⭐ {conducteur.note} · {conducteur.trajets} trajets</div>
                    <span style={{ background:'var(--primary-light)', color:'var(--primary)', padding:'0.2rem 0.8rem', borderRadius:20, fontSize:'0.72rem', fontWeight:700, display:'inline-block', marginTop:6 }}>✓ Conducteur vérifié</span>
                  </div>
                </div>
                {[['Nom complet','Youssef Amrani','text'],['Email','youssef.a@gmail.com','email'],['Téléphone','06 62 34 56 78','tel'],['N° Permis de conduire','B-123456','text']].map(([label,value,type]) => (
                  <div key={label} style={{ marginBottom:'1rem' }}>
                    <label style={{ fontSize:'0.75rem', fontWeight:700, color:'var(--muted)', textTransform:'uppercase', letterSpacing:'0.5px', display:'block', marginBottom:'0.4rem' }}>{label}</label>
                    <input type={type} defaultValue={value} style={{ width:'100%', padding:'0.85rem 1rem', border:'1.5px solid var(--border)', borderRadius:10, fontSize:'0.92rem', outline:'none', fontFamily:'inherit', background:'var(--gray)' }} />
                  </div>
                ))}
                <button style={{ width:'100%', padding:'1rem', background:'var(--primary)', color:'white', border:'none', borderRadius:10, fontSize:'1rem', fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}>Sauvegarder</button>
              </Card>
              <Card style={{ padding:'1.5rem' }}>
                <h3 style={{ fontFamily:'Bricolage Grotesque,sans-serif', fontWeight:700, marginBottom:'1rem', fontSize:'0.95rem' }}>Documents soumis</h3>
                {[['Permis de conduire','✓ Vérifié'],['Carte d\'identité','✓ Vérifié'],['Carte grise','✓ Vérifié']].map(([doc,statut]) => (
                  <div key={doc} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'0.7rem 0', borderBottom:'1px solid var(--border)' }}>
                    <span style={{ fontSize:'0.88rem', color:'var(--dark)' }}>📄 {doc}</span>
                    <span style={{ color:'var(--primary)', fontSize:'0.82rem', fontWeight:600 }}>{statut}</span>
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