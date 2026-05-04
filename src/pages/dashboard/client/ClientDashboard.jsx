import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Header from '../../../components/layout/Header'
import Footer from '../../../components/layout/Footer'
import {
  getMesReservations, getMesColis, getMesNegociations,
  annulerReservation, repondreNegociation,
  evaluerUtilisateur, creerLitige,
  getUser, logout
} from '../../../lib/api'
const COLORS = {
  'EN_ATTENTE':  { bg:'#FFF8E6', color:'#92610A' },
  'CONFIRME':    { bg:'#E8F5F0', color:'#005C3E' },
  'ANNULE':      { bg:'#FDEDED', color:'#C62828' },
  'TERMINE':     { bg:'#F1F1F1', color:'#555' },
  'EN_TRANSIT':  { bg:'#E6F1FB', color:'#185FA5' },
  'LIVRE':       { bg:'#E8F5F0', color:'#005C3E' },
  'EN_COURS':    { bg:'#FFF8E6', color:'#92610A' },
  'ACCEPTE':     { bg:'#E8F5F0', color:'#005C3E' },
  'REFUSE':      { bg:'#FDEDED', color:'#C62828' },
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
      {[1,2,3].map(i => (
        <div key={i} style={{ background:'white', borderRadius:16, height:80, border:'1px solid var(--border)', opacity:0.5 }} />
      ))}
    </div>
  )
}

const TABS = ['Vue générale','Mes réservations','Mes colis','Négociations','Évaluations','Mon profil']
export default function ClientDashboard() {
  const navigate = useNavigate()
  const user = getUser()
  const [tab, setTab] = useState('Vue générale')
  const [reservations, setReservations] = useState([])
  const [colis, setColis] = useState([])
  const [negociations, setNegociations] = useState([])
  const [loading, setLoading] = useState(true)
  const [offre, setOffre] = useState('')
  const [error, setError] = useState('')
  const [evalForm, setEvalForm] = useState({ evalueId:'', note:5, commentaire:'' })
const [litigeForm, setLitigeForm] = useState({ type:'', description:'', accuseId:'' })
const [evalSuccess, setEvalSuccess] = useState('')
const [litigeSuccess, setLitigeSuccess] = useState('')

  useEffect(() => {
    chargerDonnees()
  }, [])

  const chargerDonnees = async () => {
    setLoading(true)
    setError('')
    try {
      const [res, col, neg] = await Promise.all([
        getMesReservations(),
        getMesColis(),
        getMesNegociations()
      ])
      setReservations(Array.isArray(res) ? res : [])
      setColis(Array.isArray(col) ? col : [])
      setNegociations(Array.isArray(neg) ? neg : [])
    } catch (e) {
      setError('Erreur de chargement des données')
    } finally {
      setLoading(false)
    }
  }

  const handleAnnuler = async (id) => {
    try {
      await annulerReservation(id)
      chargerDonnees()
    } catch (e) {
      setError('Erreur lors de l\'annulation')
    }
  }

  const handleNegociation = async (id, decision, offreConducteur) => {
    try {
      await repondreNegociation(id, decision, offreConducteur)
      chargerDonnees()
    } catch (e) {
      setError('Erreur lors de la négociation')
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/')
  }
  const handleEvaluer = async () => {
  if (!evalForm.evalueId || !evalForm.note) return
  try {
    await evaluerUtilisateur({
      evalueId: parseInt(evalForm.evalueId),
      note: parseInt(evalForm.note),
      commentaire: evalForm.commentaire
    })
    setEvalSuccess('Évaluation envoyée avec succès !')
    setEvalForm({ evalueId:'', note:5, commentaire:'' })
    setTimeout(() => setEvalSuccess(''), 3000)
  } catch (e) {
    setError('Erreur lors de l\'évaluation')
  }
}

const handleLitige = async () => {
  if (!litigeForm.type || !litigeForm.accuseId) return
  try {
    await creerLitige({
      type: litigeForm.type,
      description: litigeForm.description,
      accuseId: parseInt(litigeForm.accuseId)
    })
    setLitigeSuccess('Litige signalé avec succès !')
    setLitigeForm({ type:'', description:'', accuseId:'' })
    setTimeout(() => setLitigeSuccess(''), 3000)
  } catch (e) {
    setError('Erreur lors du signalement')
  }
}

  return (
    <>
      <Header />
      <div style={{ marginTop:108, background:'var(--gray)', minHeight:'100vh' }}>

        {/* Hero */}
        <div style={{ background:'linear-gradient(135deg,#005C3E 0%,#00875A 100%)', padding:'2.5rem 3rem' }}>
          <div style={{ maxWidth:1280, margin:'0 auto', display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:'1rem' }}>
            <div style={{ display:'flex', alignItems:'center', gap:'1.2rem' }}>
              <div style={{ width:64, height:64, borderRadius:'50%', background:'rgba(255,255,255,0.2)', border:'3px solid rgba(255,255,255,0.4)', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'Bricolage Grotesque,sans-serif', fontWeight:800, fontSize:'1.5rem', color:'white' }}>
                {user?.nom?.split(' ').map(n=>n[0]).join('') || 'U'}
              </div>
              <div>
                <p style={{ color:'rgba(255,255,255,0.7)', fontSize:'0.82rem', marginBottom:2 }}>Espace client 👋</p>
                <h2 style={{ fontFamily:'Bricolage Grotesque,sans-serif', fontWeight:800, fontSize:'1.6rem', color:'white', marginBottom:3 }}>{user?.nom || 'Utilisateur'}</h2>
                <p style={{ color:'rgba(255,255,255,0.65)', fontSize:'0.82rem' }}>{user?.email}</p>
              </div>
            </div>
            <div style={{ display:'flex', gap:'0.8rem', flexWrap:'wrap' }}>
              <Link to="/trajets">
                <button style={{ background:'white', color:'var(--primary)', border:'none', borderRadius:10, padding:'0.8rem 2rem', fontWeight:700, fontSize:'0.95rem', cursor:'pointer', fontFamily:'inherit' }}>
                  🚗 Trouver un trajet
                </button>
              </Link>
              <button onClick={handleLogout} style={{ background:'rgba(255,255,255,0.15)', color:'white', border:'1.5px solid rgba(255,255,255,0.3)', borderRadius:10, padding:'0.8rem 1.5rem', fontWeight:600, fontSize:'0.9rem', cursor:'pointer', fontFamily:'inherit' }}>
                Déconnexion
              </button>
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

          {error && (
            <div style={{ background:'#FDEDED', color:'#C62828', padding:'1rem', borderRadius:10, marginBottom:'1.5rem', fontWeight:600 }}>
              ❌ {error}
            </div>
          )}

          {/* ── VUE GÉNÉRALE ── */}
          {tab === 'Vue générale' && (
            <div style={{ display:'flex', flexDirection:'column', gap:'1.5rem' }}>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))', gap:'1rem' }}>
                {[
                  ['🚗', reservations.length, 'Réservations'],
                  ['📦', colis.length, 'Colis envoyés'],
                  ['💬', negociations.filter(n=>n.statut==='EN_COURS').length, 'Négociations actives'],
                  ['✅', reservations.filter(r=>r.statut==='CONFIRME').length, 'Confirmées'],
                ].map(([ico,val,label]) => (
                  <Card key={label} style={{ padding:'1.5rem', textAlign:'center' }}>
                    <div style={{ fontSize:'1.6rem', marginBottom:'0.6rem' }}>{ico}</div>
                    <div style={{ fontFamily:'Bricolage Grotesque,sans-serif', fontSize:'2rem', fontWeight:800, color:'var(--dark)', lineHeight:1 }}>{val}</div>
                    <div style={{ fontSize:'0.78rem', color:'var(--muted)', marginTop:5 }}>{label}</div>
                  </Card>
                ))}
              </div>

              {/* Dernières réservations */}
              <Card>
                <div style={{ padding:'1.2rem 1.5rem', borderBottom:'1px solid var(--border)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                  <h3 style={{ fontFamily:'Bricolage Grotesque,sans-serif', fontWeight:700, fontSize:'1rem' }}>Dernières réservations</h3>
                  <button onClick={() => setTab('Mes réservations')} style={{ color:'var(--primary)', fontSize:'0.82rem', fontWeight:600, background:'none', border:'none', cursor:'pointer' }}>Voir tout →</button>
                </div>
                {loading ? <div style={{ padding:'1.5rem' }}><Loading /></div> :
                  reservations.length === 0 ? (
                    <div style={{ padding:'2rem', textAlign:'center', color:'var(--muted)', fontSize:'0.88rem' }}>
                      Aucune réservation pour l'instant.
                      <br />
                      <Link to="/trajets" style={{ color:'var(--primary)', fontWeight:600, textDecoration:'none' }}>Trouver un trajet →</Link>
                    </div>
                  ) : reservations.slice(0,3).map((r,i,arr) => (
                    <div key={r.id} style={{ padding:'1rem 1.5rem', borderBottom: i<arr.length-1 ? '1px solid var(--border)' : 'none', display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:'0.5rem' }}>
                      <div>
                        <div style={{ fontWeight:600, color:'var(--dark)', fontSize:'0.95rem' }}>{r.villeDepart} → {r.villeArrivee}</div>
                        <div style={{ fontSize:'0.8rem', color:'var(--muted)', marginTop:2 }}>
                          📅 {new Date(r.dateHeure).toLocaleDateString('fr-FR')} · 👤 {r.nomConducteur}
                        </div>
                      </div>
                      <div style={{ display:'flex', alignItems:'center', gap:'0.8rem' }}>
                        <span style={{ fontFamily:'Bricolage Grotesque,sans-serif', fontWeight:800 }}>{r.prixTotal} MAD</span>
                        <Badge statut={r.statut} />
                      </div>
                    </div>
                  ))
                }
              </Card>

              {/* Colis en transit */}
              <Card>
                <div style={{ padding:'1.2rem 1.5rem', borderBottom:'1px solid var(--border)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                  <h3 style={{ fontFamily:'Bricolage Grotesque,sans-serif', fontWeight:700, fontSize:'1rem' }}>Colis en transit</h3>
                  <button onClick={() => setTab('Mes colis')} style={{ color:'var(--primary)', fontSize:'0.82rem', fontWeight:600, background:'none', border:'none', cursor:'pointer' }}>Voir tout →</button>
                </div>
                {loading ? <div style={{ padding:'1.5rem' }}><Loading /></div> :
                  colis.filter(c=>c.statut==='EN_TRANSIT').length === 0 ? (
                    <div style={{ padding:'2rem', textAlign:'center', color:'var(--muted)', fontSize:'0.88rem' }}>Aucun colis en transit.</div>
                  ) : colis.filter(c=>c.statut==='EN_TRANSIT').map(c => (
                    <div key={c.id} style={{ padding:'1.2rem 1.5rem', display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:'0.8rem' }}>
                      <div>
                        <div style={{ fontWeight:600, color:'var(--dark)' }}>📦 {c.description} → {c.villeArrivee}</div>
                        <div style={{ fontSize:'0.8rem', color:'var(--muted)', marginTop:2 }}>{c.poids} kg · {c.nomDestinataire}</div>
                      </div>
                      <div style={{ display:'flex', alignItems:'center', gap:'0.8rem' }}>
                        <div style={{ background:'var(--dark)', color:'var(--gold)', padding:'0.4rem 1rem', borderRadius:8, fontFamily:'monospace', fontSize:'1.1rem', fontWeight:800, letterSpacing:4 }}>{c.codeOTP}</div>
                        <Badge statut={c.statut} />
                      </div>
                    </div>
                  ))
                }
              </Card>
            </div>
          )}

          {/* ── MES RÉSERVATIONS ── */}
          {tab === 'Mes réservations' && (
            <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
              <h2 style={{ fontFamily:'Bricolage Grotesque,sans-serif', fontSize:'1.5rem', fontWeight:800, color:'var(--dark)' }}>Mes réservations</h2>
              {loading ? <Loading /> :
                reservations.length === 0 ? (
                  <Card style={{ padding:'3rem', textAlign:'center' }}>
                    <div style={{ fontSize:'3rem', marginBottom:'1rem' }}>🚗</div>
                    <h3 style={{ fontFamily:'Bricolage Grotesque,sans-serif', fontWeight:800, marginBottom:'0.5rem' }}>Aucune réservation</h3>
                    <p style={{ color:'var(--muted)', marginBottom:'1.5rem' }}>Vous n'avez pas encore réservé de trajet.</p>
                    <Link to="/trajets">
                      <button style={{ background:'var(--primary)', color:'white', border:'none', borderRadius:10, padding:'0.8rem 2rem', fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}>
                        Trouver un trajet
                      </button>
                    </Link>
                  </Card>
                ) : reservations.map(r => (
                  <Card key={r.id} style={{ padding:'1.5rem', display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:'1rem' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:'1rem' }}>
                      <div style={{ width:48, height:48, background:'var(--primary-light)', borderRadius:12, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.4rem' }}>🚗</div>
                      <div>
                        <div style={{ fontFamily:'Bricolage Grotesque,sans-serif', fontWeight:700, fontSize:'1.05rem', color:'var(--dark)' }}>{r.villeDepart} → {r.villeArrivee}</div>
                        <div style={{ fontSize:'0.82rem', color:'var(--muted)', marginTop:3 }}>
                          📅 {new Date(r.dateHeure).toLocaleDateString('fr-FR')} · 💺 {r.nbPlaces} place(s) · 🚗 {r.nomConducteur}
                        </div>
                      </div>
                    </div>
                    <div style={{ display:'flex', alignItems:'center', gap:'0.8rem', flexWrap:'wrap' }}>
                      <span style={{ fontFamily:'Bricolage Grotesque,sans-serif', fontSize:'1.2rem', fontWeight:800 }}>{r.prixTotal} MAD</span>
                      <Badge statut={r.statut} />
                      {r.statut === 'EN_ATTENTE' && (
                        <button onClick={() => handleAnnuler(r.id)}
                          style={{ background:'#FDEDED', color:'#C62828', border:'none', borderRadius:8, padding:'0.4rem 1rem', fontSize:'0.82rem', fontWeight:600, cursor:'pointer', fontFamily:'inherit' }}>
                          ✕ Annuler
                        </button>
                      )}
                    </div>
                  </Card>
                ))
              }
            </div>
          )}

          {/* ── MES COLIS ── */}
          {tab === 'Mes colis' && (
            <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:'1rem' }}>
                <h2 style={{ fontFamily:'Bricolage Grotesque,sans-serif', fontSize:'1.5rem', fontWeight:800, color:'var(--dark)' }}>Mes colis</h2>
                <Link to="/livraison">
                  <button style={{ background:'var(--primary)', color:'white', border:'none', borderRadius:10, padding:'0.7rem 1.5rem', fontWeight:700, fontSize:'0.9rem', cursor:'pointer', fontFamily:'inherit' }}>
                    📦 Envoyer un colis
                  </button>
                </Link>
              </div>
              {loading ? <Loading /> :
                colis.length === 0 ? (
                  <Card style={{ padding:'3rem', textAlign:'center' }}>
                    <div style={{ fontSize:'3rem', marginBottom:'1rem' }}>📦</div>
                    <h3 style={{ fontFamily:'Bricolage Grotesque,sans-serif', fontWeight:800, marginBottom:'0.5rem' }}>Aucun colis</h3>
                    <p style={{ color:'var(--muted)', marginBottom:'1.5rem' }}>Vous n'avez pas encore envoyé de colis.</p>
                    <Link to="/livraison">
                      <button style={{ background:'var(--accent)', color:'white', border:'none', borderRadius:10, padding:'0.8rem 2rem', fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}>
                        Envoyer un colis
                      </button>
                    </Link>
                  </Card>
                ) : colis.map(c => (
                  <Card key={c.id} style={{ padding:'1.5rem' }}>
                    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:'1rem' }}>
                      <div style={{ display:'flex', alignItems:'center', gap:'1rem' }}>
                        <div style={{ width:48, height:48, background:'#FFF0E8', borderRadius:12, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.4rem' }}>📦</div>
                        <div>
                          <div style={{ fontFamily:'Bricolage Grotesque,sans-serif', fontWeight:700, fontSize:'1.05rem', color:'var(--dark)' }}>{c.description} → {c.villeArrivee}</div>
                          <div style={{ fontSize:'0.82rem', color:'var(--muted)', marginTop:3 }}>⚖️ {c.poids} kg · 👤 {c.nomDestinataire}</div>
                        </div>
                      </div>
                      <Badge statut={c.statut} />
                    </div>
                    {c.statut === 'EN_TRANSIT' && (
                      <div style={{ marginTop:'1rem', paddingTop:'1rem', borderTop:'1px solid var(--border)', display:'flex', alignItems:'center', gap:'1rem', flexWrap:'wrap' }}>
                        <span style={{ fontSize:'0.82rem', color:'var(--muted)', fontWeight:600 }}>Code OTP :</span>
                        <div style={{ background:'var(--dark)', color:'var(--gold)', padding:'0.5rem 1.4rem', borderRadius:8, fontFamily:'monospace', fontSize:'1.4rem', fontWeight:800, letterSpacing:6 }}>{c.codeOTP}</div>
                        <span style={{ fontSize:'0.78rem', color:'var(--muted)' }}>🔐 À communiquer uniquement au destinataire</span>
                      </div>
                    )}
                  </Card>
                ))
              }
            </div>
          )}

          {/* ── NÉGOCIATIONS ── */}
          {tab === 'Négociations' && (
            <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
              <h2 style={{ fontFamily:'Bricolage Grotesque,sans-serif', fontSize:'1.5rem', fontWeight:800, color:'var(--dark)' }}>Mes négociations</h2>
              {loading ? <Loading /> :
                negociations.length === 0 ? (
                  <Card style={{ padding:'3rem', textAlign:'center' }}>
                    <div style={{ fontSize:'3rem', marginBottom:'1rem' }}>💬</div>
                    <h3 style={{ fontFamily:'Bricolage Grotesque,sans-serif', fontWeight:800, marginBottom:'0.5rem' }}>Aucune négociation</h3>
                    <p style={{ color:'var(--muted)' }}>Vous n'avez pas encore négocié de tarif.</p>
                  </Card>
                ) : negociations.map(n => (
                  <Card key={n.id} style={{ padding:'1.5rem' }}>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1rem', flexWrap:'wrap', gap:'0.5rem' }}>
                      <div style={{ fontFamily:'Bricolage Grotesque,sans-serif', fontWeight:700, fontSize:'1.05rem' }}>🚗 {n.villeDepart} → {n.villeArrivee}</div>
                      <Badge statut={n.statut} />
                    </div>
                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem', marginBottom: n.statut==='EN_COURS' ? '1.2rem' : 0 }}>
                      <div style={{ background:'var(--primary-light)', borderRadius:12, padding:'1rem', textAlign:'center' }}>
                        <div style={{ fontSize:'0.73rem', color:'var(--primary)', fontWeight:700, marginBottom:6, textTransform:'uppercase' }}>Mon offre</div>
                        <div style={{ fontFamily:'Bricolage Grotesque,sans-serif', fontSize:'1.5rem', fontWeight:800, color:'var(--primary)' }}>{n.offreClient} MAD</div>
                      </div>
                      <div style={{ background:'var(--gray)', borderRadius:12, padding:'1rem', textAlign:'center' }}>
                        <div style={{ fontSize:'0.73rem', color:'var(--muted)', fontWeight:700, marginBottom:6, textTransform:'uppercase' }}>Offre conducteur</div>
                        <div style={{ fontFamily:'Bricolage Grotesque,sans-serif', fontSize:'1.5rem', fontWeight:800, color:'var(--dark)' }}>
                          {n.offreConducteur ? `${n.offreConducteur} MAD` : '—'}
                        </div>
                      </div>
                    </div>
                    {n.statut === 'EN_COURS' && n.offreConducteur && (
                      <div style={{ display:'flex', gap:'0.8rem', flexWrap:'wrap' }}>
                        <button onClick={() => handleNegociation(n.id, 'ACCEPTE', null)}
                          style={{ background:'var(--primary-light)', color:'var(--primary)', border:'none', borderRadius:8, padding:'0.75rem 1.4rem', fontWeight:700, fontSize:'0.88rem', cursor:'pointer', fontFamily:'inherit' }}>
                          ✓ Accepter {n.offreConducteur} MAD
                        </button>
                        <button onClick={() => handleNegociation(n.id, 'REFUSE', null)}
                          style={{ background:'#FDEDED', color:'#C62828', border:'none', borderRadius:8, padding:'0.75rem 1.2rem', fontWeight:700, fontSize:'0.88rem', cursor:'pointer', fontFamily:'inherit' }}>
                          ✕ Refuser
                        </button>
                      </div>
                    )}
                  </Card>
                ))
              }
            </div>
          )}
{tab === 'Évaluations' && (
  <div style={{ display:'flex', flexDirection:'column', gap:'1.5rem', maxWidth:700 }}>
    <h2 style={{ fontFamily:'Bricolage Grotesque,sans-serif', fontSize:'1.5rem', fontWeight:800, color:'var(--dark)' }}>Évaluations & Litiges</h2>

    {/* Évaluer un conducteur */}
    <Card style={{ padding:'2rem' }}>
      <h3 style={{ fontFamily:'Bricolage Grotesque,sans-serif', fontWeight:700, fontSize:'1rem', marginBottom:'1.2rem' }}>⭐ Évaluer un conducteur</h3>

      {evalSuccess && (
        <div style={{ background:'#E8F5F0', color:'#005C3E', padding:'0.8rem', borderRadius:8, marginBottom:'1rem', fontWeight:600 }}>✅ {evalSuccess}</div>
      )}

      <div style={{ marginBottom:'1rem' }}>
        <label style={{ fontSize:'0.75rem', fontWeight:700, color:'var(--muted)', textTransform:'uppercase', letterSpacing:'0.5px', display:'block', marginBottom:'0.4rem' }}>ID du conducteur *</label>
        <input type="number" placeholder="Ex: 3" value={evalForm.evalueId}
          onChange={e => setEvalForm({...evalForm, evalueId: e.target.value})}
          style={{ width:'100%', padding:'0.85rem 1rem', border:'1.5px solid var(--border)', borderRadius:10, fontSize:'0.92rem', outline:'none', fontFamily:'inherit' }} />
        <p style={{ fontSize:'0.75rem', color:'var(--muted)', marginTop:4 }}>Vous trouverez l'ID du conducteur dans votre réservation.</p>
      </div>

      <div style={{ marginBottom:'1rem' }}>
        <label style={{ fontSize:'0.75rem', fontWeight:700, color:'var(--muted)', textTransform:'uppercase', letterSpacing:'0.5px', display:'block', marginBottom:'0.4rem' }}>Note *</label>
        <div style={{ display:'flex', gap:'0.5rem' }}>
          {[1,2,3,4,5].map(n => (
            <button key={n} onClick={() => setEvalForm({...evalForm, note:n})}
              style={{ width:44, height:44, borderRadius:10, border:'1.5px solid', borderColor: evalForm.note>=n ? 'var(--gold)' : 'var(--border)', background: evalForm.note>=n ? '#FFF8E6' : 'white', fontSize:'1.2rem', cursor:'pointer', fontFamily:'inherit' }}>
              ⭐
            </button>
          ))}
          <span style={{ display:'flex', alignItems:'center', fontFamily:'Bricolage Grotesque,sans-serif', fontWeight:700, fontSize:'1.1rem', color:'var(--dark)', marginLeft:'0.5rem' }}>
            {evalForm.note}/5
          </span>
        </div>
      </div>

      <div style={{ marginBottom:'1.5rem' }}>
        <label style={{ fontSize:'0.75rem', fontWeight:700, color:'var(--muted)', textTransform:'uppercase', letterSpacing:'0.5px', display:'block', marginBottom:'0.4rem' }}>Commentaire</label>
        <textarea placeholder="Votre avis sur le trajet..." value={evalForm.commentaire}
          onChange={e => setEvalForm({...evalForm, commentaire: e.target.value})}
          rows={3}
          style={{ width:'100%', padding:'0.85rem 1rem', border:'1.5px solid var(--border)', borderRadius:10, fontSize:'0.92rem', outline:'none', fontFamily:'inherit', resize:'vertical' }} />
      </div>

      <button onClick={handleEvaluer}
        style={{ width:'100%', padding:'1rem', background:'var(--primary)', color:'white', border:'none', borderRadius:10, fontSize:'1rem', fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}>
        ⭐ Envoyer l'évaluation
      </button>
    </Card>

    {/* Signaler un litige */}
    <Card style={{ padding:'2rem' }}>
      <h3 style={{ fontFamily:'Bricolage Grotesque,sans-serif', fontWeight:700, fontSize:'1rem', marginBottom:'1.2rem' }}>⚠️ Signaler un litige</h3>

      {litigeSuccess && (
        <div style={{ background:'#E8F5F0', color:'#005C3E', padding:'0.8rem', borderRadius:8, marginBottom:'1rem', fontWeight:600 }}>✅ {litigeSuccess}</div>
      )}

      <div style={{ marginBottom:'1rem' }}>
        <label style={{ fontSize:'0.75rem', fontWeight:700, color:'var(--muted)', textTransform:'uppercase', letterSpacing:'0.5px', display:'block', marginBottom:'0.4rem' }}>Type de litige *</label>
        <select value={litigeForm.type} onChange={e => setLitigeForm({...litigeForm, type: e.target.value})}
          style={{ width:'100%', padding:'0.85rem 1rem', border:'1.5px solid var(--border)', borderRadius:10, fontSize:'0.92rem', outline:'none', fontFamily:'inherit', background:'var(--gray)' }}>
          <option value="">Sélectionner un type...</option>
          <option value="Colis non livré">Colis non livré</option>
          <option value="Prix non respecté">Prix non respecté</option>
          <option value="Conducteur absent">Conducteur absent</option>
          <option value="Comportement inapproprié">Comportement inapproprié</option>
          <option value="Autre">Autre</option>
        </select>
      </div>

      <div style={{ marginBottom:'1rem' }}>
        <label style={{ fontSize:'0.75rem', fontWeight:700, color:'var(--muted)', textTransform:'uppercase', letterSpacing:'0.5px', display:'block', marginBottom:'0.4rem' }}>ID du conducteur concerné *</label>
        <input type="number" placeholder="Ex: 3" value={litigeForm.accuseId}
          onChange={e => setLitigeForm({...litigeForm, accuseId: e.target.value})}
          style={{ width:'100%', padding:'0.85rem 1rem', border:'1.5px solid var(--border)', borderRadius:10, fontSize:'0.92rem', outline:'none', fontFamily:'inherit' }} />
      </div>

      <div style={{ marginBottom:'1.5rem' }}>
        <label style={{ fontSize:'0.75rem', fontWeight:700, color:'var(--muted)', textTransform:'uppercase', letterSpacing:'0.5px', display:'block', marginBottom:'0.4rem' }}>Description</label>
        <textarea placeholder="Décrivez le problème en détail..." value={litigeForm.description}
          onChange={e => setLitigeForm({...litigeForm, description: e.target.value})}
          rows={3}
          style={{ width:'100%', padding:'0.85rem 1rem', border:'1.5px solid var(--border)', borderRadius:10, fontSize:'0.92rem', outline:'none', fontFamily:'inherit', resize:'vertical' }} />
      </div>

      <button onClick={handleLitige}
        style={{ width:'100%', padding:'1rem', background:'#C62828', color:'white', border:'none', borderRadius:10, fontSize:'1rem', fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}>
        ⚠️ Signaler le litige
      </button>
    </Card>
  </div>
)}
          {/* ── MON PROFIL ── */}
          {tab === 'Mon profil' && (
            <div style={{ maxWidth:600 }}>
              <h2 style={{ fontFamily:'Bricolage Grotesque,sans-serif', fontSize:'1.5rem', fontWeight:800, color:'var(--dark)', marginBottom:'1.5rem' }}>Mon profil</h2>
              <Card style={{ padding:'2rem' }}>
                <div style={{ display:'flex', alignItems:'center', gap:'1.5rem', marginBottom:'2rem', paddingBottom:'2rem', borderBottom:'1px solid var(--border)' }}>
                  <div style={{ width:72, height:72, borderRadius:'50%', background:'linear-gradient(135deg,#00875A,#005C3E)', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'Bricolage Grotesque,sans-serif', fontWeight:800, fontSize:'1.8rem', color:'white' }}>
                    {user?.nom?.split(' ').map(n=>n[0]).join('') || 'U'}
                  </div>
                  <div>
                    <div style={{ fontFamily:'Bricolage Grotesque,sans-serif', fontWeight:800, fontSize:'1.2rem', color:'var(--dark)' }}>{user?.nom}</div>
                    <div style={{ fontSize:'0.82rem', color:'var(--muted)', marginTop:3 }}>{user?.email}</div>
                    <span style={{ background:'var(--primary-light)', color:'var(--primary)', padding:'0.2rem 0.8rem', borderRadius:20, fontSize:'0.72rem', fontWeight:700, display:'inline-block', marginTop:6 }}>✓ Client vérifié</span>
                  </div>
                </div>
                {[['Nom complet', user?.nom, 'text'],['Email', user?.email, 'email']].map(([label,value,type]) => (
                  <div key={label} style={{ marginBottom:'1.2rem' }}>
                    <label style={{ fontSize:'0.75rem', fontWeight:700, color:'var(--muted)', textTransform:'uppercase', letterSpacing:'0.5px', display:'block', marginBottom:'0.4rem' }}>{label}</label>
                    <input type={type} defaultValue={value} style={{ width:'100%', padding:'0.85rem 1rem', border:'1.5px solid var(--border)', borderRadius:10, fontSize:'0.92rem', outline:'none', fontFamily:'inherit', background:'var(--gray)' }} />
                  </div>
                ))}
                <button style={{ width:'100%', padding:'1rem', background:'var(--primary)', color:'white', border:'none', borderRadius:10, fontSize:'1rem', fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}>
                  Sauvegarder
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