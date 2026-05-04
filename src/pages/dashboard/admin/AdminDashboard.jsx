import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../../../components/layout/Header'
import Footer from '../../../components/layout/Footer'
import {
  getStats, getAllUtilisateurs, bloquerUtilisateur, debloquerUtilisateur,
  getDocumentsEnAttente, validerDocument, rejeterDocument,
  getLitiges, resoudreLitige, mettreEnCoursLitige,
  getUser, logout
} from '../../../lib/api'
const COLORS = {
  'actif':   { bg:'#E8F5F0', color:'#005C3E' },
  'bloqué':  { bg:'#FDEDED', color:'#C62828' },
  'CLIENT':      { bg:'#E6F1FB', color:'#185FA5' },
  'CONDUCTEUR':  { bg:'#E8F5F0', color:'#005C3E' },
  'ADMIN':       { bg:'#F3EEFF', color:'#6B21A8' },
}

function Badge({ label, type }) {
  const s = COLORS[label] || { bg:'#eee', color:'#555' }
  return <span style={{ ...s, padding:'0.3rem 0.9rem', borderRadius:20, fontSize:'0.75rem', fontWeight:700 }}>{label}</span>
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

const TABS = ['Vue générale', 'Utilisateurs', 'Documents', 'Litiges', 'Statistiques']
export default function AdminDashboard() {
  const navigate = useNavigate()
  const user = getUser()
  const [tab, setTab] = useState('Vue générale')
  const [stats, setStats] = useState(null)
  const [utilisateurs, setUtilisateurs] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
const [documents, setDocuments] = useState([])
const [litiges, setLitiges] = useState([])
  useEffect(() => {
    chargerDonnees()
  }, [])

  const chargerDonnees = async () => {
    setLoading(true)
    setError('')
    try {
      const [s, u, docs, lits] = await Promise.all([
  getStats(),
  getAllUtilisateurs(),
  getDocumentsEnAttente(),
  getLitiges()
])
setStats(s)
setUtilisateurs(Array.isArray(u) ? u : [])
setDocuments(Array.isArray(docs) ? docs : [])
setLitiges(Array.isArray(lits) ? lits : [])
      setStats(s)
      setUtilisateurs(Array.isArray(u) ? u : [])
    } catch (e) {
      setError('Erreur de chargement')
    } finally {
      setLoading(false)
    }
  }
  

  const handleBloquer = async (id) => {
    try {
      await bloquerUtilisateur(id)
      setSuccess('Utilisateur bloqué !')
      chargerDonnees()
      setTimeout(() => setSuccess(''), 3000)
    } catch (e) {
      setError('Erreur lors du blocage')
    }
  }

  const handleDebloquer = async (id) => {
    try {
      await debloquerUtilisateur(id)
      setSuccess('Utilisateur débloqué !')
      chargerDonnees()
      setTimeout(() => setSuccess(''), 3000)
    } catch (e) {
      setError('Erreur lors du déblocage')
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/')
  }
const handleValiderDoc = async (id) => {
  await validerDocument(id)
  setSuccess('Conducteur validé !')
  chargerDonnees()
  setTimeout(() => setSuccess(''), 3000)
}

const handleRejeterDoc = async (id) => {
  await rejeterDocument(id)
  setSuccess('Documents rejetés.')
  chargerDonnees()
  setTimeout(() => setSuccess(''), 3000)
}

const handleResoudre = async (id) => {
  await resoudreLitige(id)
  setSuccess('Litige marqué comme résolu !')
  chargerDonnees()
  setTimeout(() => setSuccess(''), 3000)
}

const handleEnCours = async (id) => {
  await mettreEnCoursLitige(id)
  chargerDonnees()
}
  const utilisateursFiltres = utilisateurs.filter(u =>
    u.nom?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  )

  const conducteurs = utilisateurs.filter(u => u.role === 'CONDUCTEUR')
  const clients = utilisateurs.filter(u => u.role === 'CLIENT')
  const bloques = utilisateurs.filter(u => !u.estActif)

  return (
    <>
      <Header />
      <div style={{ marginTop:108, background:'var(--gray)', minHeight:'100vh' }}>

        {/* Hero */}
        <div style={{ background:'linear-gradient(135deg,#1a0533 0%,#2d1054 100%)', padding:'2.5rem 3rem' }}>
          <div style={{ maxWidth:1280, margin:'0 auto', display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:'1rem' }}>
            <div style={{ display:'flex', alignItems:'center', gap:'1.2rem' }}>
              <div style={{ width:64, height:64, borderRadius:'50%', background:'rgba(255,255,255,0.15)', border:'3px solid rgba(255,255,255,0.3)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.8rem' }}>⚙️</div>
              <div>
                <p style={{ color:'rgba(255,255,255,0.6)', fontSize:'0.82rem', marginBottom:2 }}>Back-office admin</p>
                <h2 style={{ fontFamily:'Bricolage Grotesque,sans-serif', fontWeight:800, fontSize:'1.6rem', color:'white', marginBottom:3 }}>
                  Tableau de bord
                </h2>
                <p style={{ color:'rgba(255,255,255,0.5)', fontSize:'0.82rem' }}>{user?.email}</p>
              </div>
            </div>
            <div style={{ display:'flex', gap:'0.8rem', flexWrap:'wrap' }}>
              <span style={{ background:'rgba(255,255,255,0.1)', color:'white', padding:'0.5rem 1rem', borderRadius:8, fontSize:'0.82rem', fontWeight:600 }}>
                🟢 Système opérationnel
              </span>
              <button onClick={handleLogout}
                style={{ background:'rgba(255,255,255,0.1)', color:'white', border:'1.5px solid rgba(255,255,255,0.2)', borderRadius:10, padding:'0.5rem 1.2rem', fontWeight:600, fontSize:'0.88rem', cursor:'pointer', fontFamily:'inherit' }}>
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
            <div style={{ background:'#FDEDED', color:'#C62828', padding:'1rem', borderRadius:10, marginBottom:'1.5rem', fontWeight:600 }}>❌ {error}</div>
          )}
          {success && (
            <div style={{ background:'#E8F5F0', color:'#005C3E', padding:'1rem', borderRadius:10, marginBottom:'1.5rem', fontWeight:600 }}>✅ {success}</div>
          )}

          {/* ── VUE GÉNÉRALE ── */}
          {tab === 'Vue générale' && (
            <div style={{ display:'flex', flexDirection:'column', gap:'1.5rem' }}>

              {/* Stats principales */}
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))', gap:'1rem' }}>
                {[
                  ['👥', stats?.totalUtilisateurs ?? '—', 'Utilisateurs total'],
                  ['🚗', stats?.totalTrajets ?? '—', 'Trajets publiés'],
                  ['📋', stats?.totalReservations ?? '—', 'Réservations'],
                  ['📦', stats?.totalColis ?? '—', 'Colis envoyés'],
                  ['🚗', conducteurs.length, 'Conducteurs'],
                  ['⛔', bloques.length, 'Comptes bloqués'],
                ].map(([ico,val,label]) => (
                  <Card key={label} style={{ padding:'1.5rem', textAlign:'center' }}>
                    <div style={{ fontSize:'1.6rem', marginBottom:'0.6rem' }}>{ico}</div>
                    <div style={{ fontFamily:'Bricolage Grotesque,sans-serif', fontSize:'1.8rem', fontWeight:800, color:'var(--dark)', lineHeight:1 }}>
                      {loading ? '—' : val}
                    </div>
                    <div style={{ fontSize:'0.75rem', color:'var(--muted)', marginTop:5 }}>{label}</div>
                  </Card>
                ))}
              </div>

              {/* Derniers utilisateurs */}
              <Card>
                <div style={{ padding:'1.2rem 1.5rem', borderBottom:'1px solid var(--border)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                  <h3 style={{ fontFamily:'Bricolage Grotesque,sans-serif', fontWeight:700, fontSize:'1rem' }}>Derniers inscrits</h3>
                  <button onClick={() => setTab('Utilisateurs')} style={{ color:'var(--primary)', fontSize:'0.82rem', fontWeight:600, background:'none', border:'none', cursor:'pointer' }}>Voir tout →</button>
                </div>
                {loading ? <div style={{ padding:'1.5rem' }}><Loading /></div> :
                  utilisateurs.slice(0,5).map((u,i,arr) => (
                    <div key={u.id} style={{ padding:'1rem 1.5rem', borderBottom: i<arr.length-1 ? '1px solid var(--border)' : 'none', display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:'0.5rem' }}>
                      <div style={{ display:'flex', alignItems:'center', gap:'0.8rem' }}>
                        <div style={{ width:36, height:36, borderRadius:'50%', background: u.role==='CONDUCTEUR' ? 'var(--dark)' : 'var(--primary-light)', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, fontSize:'0.8rem', color: u.role==='CONDUCTEUR' ? 'white' : 'var(--primary)' }}>
                          {u.nom?.split(' ').map(n=>n[0]).join('') || 'U'}
                        </div>
                        <div>
                          <div style={{ fontWeight:600, color:'var(--dark)', fontSize:'0.88rem' }}>{u.nom}</div>
                          <div style={{ fontSize:'0.78rem', color:'var(--muted)' }}>{u.email}</div>
                        </div>
                      </div>
                      <div style={{ display:'flex', alignItems:'center', gap:'0.6rem' }}>
                        <Badge label={u.role} />
                        <Badge label={u.estActif ? 'actif' : 'bloqué'} />
                      </div>
                    </div>
                  ))
                }
              </Card>

              {/* Répartition */}
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1.5rem' }}>
                <Card style={{ padding:'1.5rem' }}>
                  <h3 style={{ fontFamily:'Bricolage Grotesque,sans-serif', fontWeight:700, marginBottom:'1.2rem', fontSize:'0.95rem' }}>Répartition des utilisateurs</h3>
                  {[
                    ['Clients', clients.length, utilisateurs.length],
                    ['Conducteurs', conducteurs.length, utilisateurs.length],
                    ['Comptes bloqués', bloques.length, utilisateurs.length],
                  ].map(([label, val, total]) => {
                    const pct = total > 0 ? Math.round((val/total)*100) : 0
                    return (
                      <div key={label} style={{ marginBottom:'0.9rem' }}>
                        <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
                          <span style={{ fontSize:'0.85rem', fontWeight:600, color:'var(--dark)' }}>{label}</span>
                          <span style={{ fontSize:'0.82rem', color:'var(--muted)', fontWeight:600 }}>{val} ({pct}%)</span>
                        </div>
                        <div style={{ background:'var(--gray2)', borderRadius:20, height:8 }}>
                          <div style={{ background:'var(--primary)', borderRadius:20, height:8, width:`${pct}%`, transition:'width 0.5s' }} />
                        </div>
                      </div>
                    )
                  })}
                </Card>

                <Card style={{ padding:'1.5rem' }}>
                  <h3 style={{ fontFamily:'Bricolage Grotesque,sans-serif', fontWeight:700, marginBottom:'1.2rem', fontSize:'0.95rem' }}>Activité de la plateforme</h3>
                  {[
                    ['📋', 'Réservations', stats?.totalReservations ?? 0],
                    ['📦', 'Colis', stats?.totalColis ?? 0],
                    ['🚗', 'Trajets', stats?.totalTrajets ?? 0],
                  ].map(([ico, label, val]) => (
                    <div key={label} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0.7rem 0', borderBottom:'1px solid var(--border)' }}>
                      <span style={{ fontSize:'0.88rem', color:'var(--dark)' }}>{ico} {label}</span>
                      <span style={{ fontFamily:'Bricolage Grotesque,sans-serif', fontWeight:800, fontSize:'1.1rem', color:'var(--primary)' }}>{loading ? '—' : val}</span>
                    </div>
                  ))}
                </Card>
              </div>

            </div>
          )}

          {/* ── UTILISATEURS ── */}
          {tab === 'Utilisateurs' && (
            <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:'1rem' }}>
                <h2 style={{ fontFamily:'Bricolage Grotesque,sans-serif', fontSize:'1.5rem', fontWeight:800, color:'var(--dark)' }}>
                  Gestion des utilisateurs
                  <span style={{ fontFamily:'Plus Jakarta Sans,sans-serif', fontSize:'1rem', fontWeight:500, color:'var(--muted)', marginLeft:'0.8rem' }}>
                    ({utilisateurs.length} total)
                  </span>
                </h2>
                <input
                  placeholder="🔍 Rechercher par nom ou email..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  style={{ padding:'0.7rem 1rem', border:'1.5px solid var(--border)', borderRadius:8, fontSize:'0.88rem', outline:'none', fontFamily:'inherit', minWidth:280 }}
                />
              </div>

              {/* Filtres rapides */}
              <div style={{ display:'flex', gap:'0.6rem', flexWrap:'wrap' }}>
                {[
                  ['Tous', utilisateurs.length],
                  ['Clients', clients.length],
                  ['Conducteurs', conducteurs.length],
                  ['Bloqués', bloques.length],
                ].map(([label, count]) => (
                  <span key={label} style={{ background:'white', border:'1px solid var(--border)', borderRadius:20, padding:'0.3rem 1rem', fontSize:'0.82rem', fontWeight:600, color:'var(--muted)', cursor:'pointer' }}>
                    {label} ({count})
                  </span>
                ))}
              </div>

              {loading ? <Loading /> :
                utilisateursFiltres.length === 0 ? (
                  <Card style={{ padding:'3rem', textAlign:'center' }}>
                    <div style={{ fontSize:'3rem', marginBottom:'1rem' }}>👥</div>
                    <h3 style={{ fontFamily:'Bricolage Grotesque,sans-serif', fontWeight:800 }}>Aucun utilisateur trouvé</h3>
                  </Card>
                ) : utilisateursFiltres.map(u => (
                  <Card key={u.id} style={{ padding:'1.5rem', display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:'1rem' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:'1rem' }}>
                      <div style={{ width:48, height:48, borderRadius:'50%', background: u.role==='CONDUCTEUR' ? 'var(--dark)' : u.role==='ADMIN' ? '#F3EEFF' : 'var(--primary-light)', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, fontSize:'0.9rem', color: u.role==='CONDUCTEUR' ? 'white' : u.role==='ADMIN' ? '#6B21A8' : 'var(--primary)' }}>
                        {u.nom?.split(' ').map(n=>n[0]).join('') || 'U'}
                      </div>
                      <div>
                        <div style={{ fontWeight:700, color:'var(--dark)', fontSize:'0.95rem' }}>{u.nom}</div>
                        <div style={{ fontSize:'0.8rem', color:'var(--muted)', marginTop:2 }}>{u.email}</div>
                        <div style={{ display:'flex', gap:'0.5rem', marginTop:4 }}>
                          <Badge label={u.role} />
                          <Badge label={u.estActif ? 'actif' : 'bloqué'} />
                        </div>
                      </div>
                    </div>
                    <div style={{ display:'flex', gap:'0.6rem', flexWrap:'wrap' }}>
                      {u.estActif ? (
                        <button onClick={() => handleBloquer(u.id)}
                          style={{ background:'#FDEDED', color:'#C62828', border:'none', borderRadius:8, padding:'0.5rem 1.2rem', fontSize:'0.85rem', fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}>
                          🔒 Bloquer
                        </button>
                      ) : (
                        <button onClick={() => handleDebloquer(u.id)}
                          style={{ background:'var(--primary-light)', color:'var(--primary)', border:'none', borderRadius:8, padding:'0.5rem 1.2rem', fontSize:'0.85rem', fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}>
                          🔓 Débloquer
                        </button>
                      )}
                    </div>
                  </Card>
                ))
              }
            </div>
          )}

          {/* ── STATISTIQUES ── */}
          {tab === 'Statistiques' && (
            <div style={{ display:'flex', flexDirection:'column', gap:'1.5rem' }}>
              <h2 style={{ fontFamily:'Bricolage Grotesque,sans-serif', fontSize:'1.5rem', fontWeight:800, color:'var(--dark)' }}>Statistiques plateforme</h2>

              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))', gap:'1rem' }}>
                {[
                  ['👥', 'Total utilisateurs', stats?.totalUtilisateurs ?? 0, 'var(--primary)'],
                  ['🚗', 'Total trajets', stats?.totalTrajets ?? 0, 'var(--dark)'],
                  ['📋', 'Total réservations', stats?.totalReservations ?? 0, 'var(--accent)'],
                  ['📦', 'Total colis', stats?.totalColis ?? 0, '#185FA5'],
                ].map(([ico,label,val,color]) => (
                  <Card key={label} style={{ padding:'1.5rem', borderTop:`4px solid ${color}` }}>
                    <div style={{ fontSize:'1.8rem', marginBottom:'0.6rem' }}>{ico}</div>
                    <div style={{ fontFamily:'Bricolage Grotesque,sans-serif', fontSize:'2rem', fontWeight:800, color:'var(--dark)', lineHeight:1, marginBottom:4 }}>
                      {loading ? '—' : val}
                    </div>
                    <div style={{ fontSize:'0.82rem', color:'var(--muted)' }}>{label}</div>
                  </Card>
                ))}
              </div>

              <Card style={{ padding:'1.5rem' }}>
                <h3 style={{ fontFamily:'Bricolage Grotesque,sans-serif', fontWeight:700, marginBottom:'1.5rem' }}>Répartition des rôles</h3>
                {[
                  ['Clients', clients.length, 'var(--primary)'],
                  ['Conducteurs', conducteurs.length, 'var(--dark)'],
                  ['Admins', utilisateurs.filter(u=>u.role==='ADMIN').length, '#6B21A8'],
                  ['Comptes bloqués', bloques.length, '#C62828'],
                ].map(([label, val, color]) => {
                  const pct = utilisateurs.length > 0 ? Math.round((val/utilisateurs.length)*100) : 0
                  return (
                    <div key={label} style={{ marginBottom:'1rem' }}>
                      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
                        <span style={{ fontSize:'0.9rem', fontWeight:600, color:'var(--dark)' }}>{label}</span>
                        <span style={{ fontSize:'0.85rem', color:'var(--muted)', fontWeight:600 }}>{val} ({pct}%)</span>
                      </div>
                      <div style={{ background:'var(--gray2)', borderRadius:20, height:10 }}>
                        <div style={{ background:color, borderRadius:20, height:10, width:`${pct}%`, transition:'width 0.6s' }} />
                      </div>
                    </div>
                  )
                })}
              </Card>

              <Card style={{ padding:'1.5rem' }}>
                <h3 style={{ fontFamily:'Bricolage Grotesque,sans-serif', fontWeight:700, marginBottom:'1rem' }}>Résumé général</h3>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))', gap:'1rem' }}>
                  {[
                    ['Total utilisateurs actifs', utilisateurs.filter(u=>u.estActif).length],
                    ['Taux d\'activation', `${utilisateurs.length > 0 ? Math.round((utilisateurs.filter(u=>u.estActif).length/utilisateurs.length)*100) : 0}%`],
                    ['Conducteurs / Clients', `${conducteurs.length} / ${clients.length}`],
                    ['Comptes bloqués', bloques.length],
                  ].map(([label, val]) => (
                    <div key={label} style={{ background:'var(--gray)', borderRadius:12, padding:'1rem' }}>
                      <div style={{ fontSize:'0.75rem', color:'var(--muted)', fontWeight:600, textTransform:'uppercase', marginBottom:6 }}>{label}</div>
                      <div style={{ fontFamily:'Bricolage Grotesque,sans-serif', fontSize:'1.4rem', fontWeight:800, color:'var(--dark)' }}>{val}</div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          )}
          {tab === 'Documents' && (
  <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
    <h2 style={{ fontFamily:'Bricolage Grotesque,sans-serif', fontSize:'1.5rem', fontWeight:800, color:'var(--dark)' }}>
      Validation des documents
      <span style={{ fontFamily:'Plus Jakarta Sans,sans-serif', fontSize:'1rem', fontWeight:500, color:'var(--muted)', marginLeft:'0.8rem' }}>
        ({documents.length} en attente)
      </span>
    </h2>
    

    {loading ? <Loading /> :
      documents.length === 0 ? (
        <Card style={{ padding:'3rem', textAlign:'center' }}>
          <div style={{ fontSize:'3rem', marginBottom:'1rem' }}>✅</div>
          <h3 style={{ fontFamily:'Bricolage Grotesque,sans-serif', fontWeight:800 }}>Aucun document en attente</h3>
          <p style={{ color:'var(--muted)' }}>Tous les conducteurs ont été traités.</p>
        </Card>
      ) : documents.map(d => (
  <Card key={d.id} style={{ padding:'1.5rem' }}>
    <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', flexWrap:'wrap', gap:'1rem' }}>

      {/* Infos conducteur */}
      <div style={{ display:'flex', alignItems:'center', gap:'1rem' }}>
        <div style={{ width:48, height:48, background:'#F3EEFF', borderRadius:12, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.4rem' }}>👤</div>
        <div>
          <div style={{ fontFamily:'Bricolage Grotesque,sans-serif', fontWeight:700, fontSize:'1.05rem', color:'var(--dark)' }}>{d.nom}</div>
          <div style={{ fontSize:'0.82rem', color:'var(--muted)', marginTop:2 }}>{d.email} · {d.telephone}</div>
          {d.marqueVoiture && (
            <span style={{ background:'#E6F1FB', color:'#185FA5', padding:'0.2rem 0.6rem', borderRadius:6, fontSize:'0.75rem', fontWeight:600, display:'inline-block', marginTop:4 }}>
              🚗 {d.marqueVoiture}
            </span>
          )}
        </div>
      </div>

      {/* Boutons valider/rejeter */}
      <div style={{ display:'flex', gap:'0.8rem', flexWrap:'wrap' }}>
        <button onClick={() => handleValiderDoc(d.id)}
          style={{ background:'var(--primary-light)', color:'var(--primary)', border:'none', borderRadius:8, padding:'0.6rem 1.3rem', fontSize:'0.88rem', fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}>
          ✓ Valider
        </button>
        <button onClick={() => handleRejeterDoc(d.id)}
          style={{ background:'#FDEDED', color:'#C62828', border:'none', borderRadius:8, padding:'0.6rem 1.3rem', fontSize:'0.88rem', fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}>
          ✕ Rejeter
        </button>
      </div>
    </div>

    {/* Documents visuels */}
    <div style={{ marginTop:'1.2rem', paddingTop:'1.2rem', borderTop:'1px solid var(--border)', display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(150px,1fr))', gap:'1rem' }}>

      {/* Photo Permis */}
      {d.permisConduire && (
        <a href={`http://localhost:8080/api/documents/fichier/${d.permisConduire}`} target="_blank" rel="noreferrer"
          style={{ textDecoration:'none', display:'block' }}>
          <div style={{ border:'1px solid var(--border)', borderRadius:10, overflow:'hidden', background:'var(--gray)' }}>
            <img
              src={`http://localhost:8080/api/documents/fichier/${d.permisConduire}`}
              alt="Permis"
              style={{ width:'100%', height:100, objectFit:'cover' }}
              onError={e => e.target.style.display='none'}
            />
            <div style={{ padding:'0.5rem', textAlign:'center', fontSize:'0.78rem', fontWeight:600, color:'var(--primary)' }}>
              📷 Permis de conduire
            </div>
          </div>
        </a>
      )}

      {/* Photo CIN */}
      {d.pieceIdentite && (
        <a href={`http://localhost:8080/api/documents/fichier/${d.pieceIdentite}`} target="_blank" rel="noreferrer"
          style={{ textDecoration:'none', display:'block' }}>
          <div style={{ border:'1px solid var(--border)', borderRadius:10, overflow:'hidden', background:'var(--gray)' }}>
            <img
              src={`http://localhost:8080/api/documents/fichier/${d.pieceIdentite}`}
              alt="CIN"
              style={{ width:'100%', height:100, objectFit:'cover' }}
              onError={e => e.target.style.display='none'}
            />
            <div style={{ padding:'0.5rem', textAlign:'center', fontSize:'0.78rem', fontWeight:600, color:'var(--primary)' }}>
              🪪 Pièce d'identité
            </div>
          </div>
        </a>
      )}

      {/* Photo Voiture */}
      {d.photoVoiture && (
        <a href={`http://localhost:8080/api/documents/fichier/${d.photoVoiture}`} target="_blank" rel="noreferrer"
          style={{ textDecoration:'none', display:'block' }}>
          <div style={{ border:'1px solid var(--border)', borderRadius:10, overflow:'hidden', background:'var(--gray)' }}>
            <img
              src={`http://localhost:8080/api/documents/fichier/${d.photoVoiture}`}
              alt="Voiture"
              style={{ width:'100%', height:100, objectFit:'cover' }}
              onError={e => e.target.style.display='none'}
            />
            <div style={{ padding:'0.5rem', textAlign:'center', fontSize:'0.78rem', fontWeight:600, color:'#185FA5' }}>
              🚗 Photo véhicule
            </div>
          </div>
        </a>
      )}

      {/* Carte grise PDF */}
      {d.carteGrise && (
        <a href={`http://localhost:8080/api/documents/fichier/${d.carteGrise}`} target="_blank" rel="noreferrer"
          style={{ textDecoration:'none', display:'block' }}>
          <div style={{ border:'1px solid var(--border)', borderRadius:10, background:'var(--gray)', padding:'1rem', textAlign:'center' }}>
            <div style={{ fontSize:'2.5rem', marginBottom:'0.4rem' }}>📄</div>
            <div style={{ fontSize:'0.78rem', fontWeight:600, color:'var(--accent)' }}>
              Carte grise (PDF)
            </div>
          </div>
        </a>
      )}

    </div>
  </Card>
))}
    
  </div>
)}
{tab === 'Litiges' && (
  <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
    <h2 style={{ fontFamily:'Bricolage Grotesque,sans-serif', fontSize:'1.5rem', fontWeight:800, color:'var(--dark)' }}>
      Gestion des litiges
      <span style={{ fontFamily:'Plus Jakarta Sans,sans-serif', fontSize:'1rem', fontWeight:500, color:'var(--muted)', marginLeft:'0.8rem' }}>
        ({litiges.filter(l=>l.statut==='OUVERT').length} ouverts)
      </span>
    </h2>

    {loading ? <Loading /> :
      litiges.length === 0 ? (
        <Card style={{ padding:'3rem', textAlign:'center' }}>
          <div style={{ fontSize:'3rem', marginBottom:'1rem' }}>✅</div>
          <h3 style={{ fontFamily:'Bricolage Grotesque,sans-serif', fontWeight:800 }}>Aucun litige</h3>
          <p style={{ color:'var(--muted)' }}>Tout est en ordre sur la plateforme.</p>
        </Card>
      ) : litiges.map(l => (
        <Card key={l.id} style={{ padding:'1.5rem' }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'1rem', flexWrap:'wrap', gap:'0.5rem' }}>
            <div style={{ fontFamily:'Bricolage Grotesque,sans-serif', fontWeight:700, fontSize:'1.05rem', color:'var(--dark)' }}>
              ⚠️ {l.type}
            </div>
            <span style={{
              background: l.statut==='OUVERT' ? '#FDEDED' : l.statut==='EN_COURS' ? '#FFF8E6' : '#E8F5F0',
              color: l.statut==='OUVERT' ? '#C62828' : l.statut==='EN_COURS' ? '#92610A' : '#005C3E',
              padding:'0.3rem 0.9rem', borderRadius:20, fontSize:'0.75rem', fontWeight:700
            }}>{l.statut}</span>
          </div>

          {l.description && (
            <p style={{ color:'var(--muted)', fontSize:'0.88rem', marginBottom:'1rem', fontStyle:'italic' }}>"{l.description}"</p>
          )}

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem', marginBottom:'1rem' }}>
            <div style={{ background:'var(--gray)', borderRadius:10, padding:'1rem' }}>
              <div style={{ fontSize:'0.73rem', color:'var(--muted)', fontWeight:700, marginBottom:4, textTransform:'uppercase' }}>Plaignant</div>
              <div style={{ fontWeight:600, color:'var(--dark)' }}>👤 {l.nomPlaignant}</div>
            </div>
            <div style={{ background:'var(--gray)', borderRadius:10, padding:'1rem' }}>
              <div style={{ fontSize:'0.73rem', color:'var(--muted)', fontWeight:700, marginBottom:4, textTransform:'uppercase' }}>Accusé</div>
              <div style={{ fontWeight:600, color:'var(--dark)' }}>🚗 {l.nomAccuse}</div>
            </div>
          </div>

          {l.statut !== 'RESOLU' && (
            <div style={{ display:'flex', gap:'0.8rem', flexWrap:'wrap' }}>
              {l.statut === 'OUVERT' && (
                <button onClick={() => handleEnCours(l.id)}
                  style={{ background:'#FFF8E6', color:'#92610A', border:'none', borderRadius:8, padding:'0.6rem 1.3rem', fontSize:'0.85rem', fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}>
                  🔄 Mettre en cours
                </button>
              )}
              <button onClick={() => handleResoudre(l.id)}
                style={{ background:'var(--primary-light)', color:'var(--primary)', border:'none', borderRadius:8, padding:'0.6rem 1.3rem', fontSize:'0.85rem', fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}>
                ✓ Marquer résolu
              </button>
              <button style={{ background:'var(--gray)', color:'var(--dark)', border:'none', borderRadius:8, padding:'0.6rem 1.3rem', fontSize:'0.85rem', fontWeight:600, cursor:'pointer', fontFamily:'inherit' }}>
                📧 Contacter les parties
              </button>
            </div>
          )}

          {l.dateCreation && (
            <div style={{ marginTop:'0.8rem', fontSize:'0.78rem', color:'var(--muted)' }}>
              📅 Signalé le {new Date(l.dateCreation).toLocaleDateString('fr-FR')}
              {l.dateResolution && ` · Résolu le ${new Date(l.dateResolution).toLocaleDateString('fr-FR')}`}
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