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

function Badge({ label }) {
  const colors = {
    'actif':      { bg:'#E8F5F0', color:'#00875A' },
    'bloqué':     { bg:'#FEE2E2', color:'#7F1D1D' },
    'CLIENT':     { bg:'#DBEAFE', color:'#1E3A8A' },
    'CONDUCTEUR': { bg:'#E8F5F0', color:'#00875A' },
    'ADMIN':      { bg:'#EDE9FE', color:'#4C1D95' },
  }
  const s = colors[label] || { bg:'#F3F4F6', color:'#374151' }
  return (
    <span style={{ ...s, padding:'0.2rem 0.7rem', borderRadius:20, fontSize:'0.72rem', fontWeight:600, fontFamily:'system-ui,sans-serif' }}>
      {label}
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

const TABS = ['Vue générale', 'Utilisateurs', 'Documents', 'Litiges', 'Statistiques']

export default function AdminDashboard() {
  const navigate = useNavigate()
  const user = getUser()
  const [tab, setTab] = useState('Vue générale')
  const [stats, setStats] = useState(null)
  const [utilisateurs, setUtilisateurs] = useState([])
  const [documents, setDocuments] = useState([])
  const [litiges, setLitiges] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => { chargerDonnees() }, [])

  const chargerDonnees = async () => {
    setLoading(true)
    setError('')
    try {
      const [s, u, docs, lits] = await Promise.all([
        getStats(), getAllUtilisateurs(),
        getDocumentsEnAttente(), getLitiges()
      ])
      setStats(s)
      setUtilisateurs(Array.isArray(u) ? u : [])
      setDocuments(Array.isArray(docs) ? docs : [])
      setLitiges(Array.isArray(lits) ? lits : [])
    } catch (e) {
      setError('Erreur de chargement')
    } finally {
      setLoading(false)
    }
  }

  const handleBloquer = async (id) => {
    await bloquerUtilisateur(id); setSuccess('Utilisateur bloqué.')
    chargerDonnees(); setTimeout(() => setSuccess(''), 3000)
  }
  const handleDebloquer = async (id) => {
    await debloquerUtilisateur(id); setSuccess('Utilisateur débloqué.')
    chargerDonnees(); setTimeout(() => setSuccess(''), 3000)
  }
  const handleValiderDoc = async (id) => {
    await validerDocument(id); setSuccess('Conducteur validé.')
    chargerDonnees(); setTimeout(() => setSuccess(''), 3000)
  }
  const handleRejeterDoc = async (id) => {
    await rejeterDocument(id); setSuccess('Documents rejetés.')
    chargerDonnees(); setTimeout(() => setSuccess(''), 3000)
  }
  const handleResoudre = async (id) => {
    await resoudreLitige(id); setSuccess('Litige résolu.')
    chargerDonnees(); setTimeout(() => setSuccess(''), 3000)
  }
  const handleEnCours = async (id) => {
    await mettreEnCoursLitige(id); chargerDonnees()
  }
  const handleLogout = () => { logout(); navigate('/') }

  const conducteurs = utilisateurs.filter(u => u.role === 'CONDUCTEUR')
  const clients = utilisateurs.filter(u => u.role === 'CLIENT')
  const bloques = utilisateurs.filter(u => !u.estActif)
  const utilisateursFiltres = utilisateurs.filter(u =>
    u.nom?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  )

  const btnStyle = (color = '#00875A') => ({
    display:'inline-flex', alignItems:'center', gap:'0.4rem',
    padding:'0.55rem 1.2rem', background:color, color:'white',
    border:'none', borderRadius:8, fontWeight:600, fontSize:'0.83rem',
    cursor:'pointer', fontFamily:'system-ui,sans-serif',
    transition:'all 0.2s', boxShadow:'0 2px 6px rgba(0,0,0,0.1)'
  })

  const adminStats = [
    { val: stats?.totalUtilisateurs ?? 0, label: 'Utilisateurs' },
    { val: stats?.totalTrajets ?? 0, label: 'Trajets' },
    { val: stats?.totalReservations ?? 0, label: 'Réservations' },
    { val: stats?.totalColis ?? 0, label: 'Colis' },
    { val: conducteurs.length, label: 'Conducteurs' },
    { val: bloques.length, label: 'Bloqués' },
  ]

  return (
    <>
      <Header />
      <div style={{ marginTop:108, background:'#F9FAFB', minHeight:'100vh' }}>

        {/* Hero */}
        <div style={{ background:'#111827', padding:'2rem 3rem' }}>
          <div style={{ maxWidth:1280, margin:'0 auto', display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:'1rem' }}>
            <div style={{ display:'flex', alignItems:'center', gap:'1.2rem' }}>
              <div style={{ width:60, height:60, borderRadius:'50%', background:'#374151', display:'flex', alignItems:'center', justifyContent:'center', color:'#E5E7EB', fontWeight:700, fontSize:'1.2rem', fontFamily:'system-ui,sans-serif', flexShrink:0, boxShadow:'0 0 0 4px rgba(55,65,81,0.3)' }}>
                A
              </div>
              <div>
                <div style={{ display:'inline-flex', alignItems:'center', gap:'0.4rem', background:'rgba(255,255,255,0.12)', color:'white', padding:'0.25rem 0.8rem', borderRadius:50, fontSize:'0.75rem', fontWeight:500, fontFamily:'system-ui,sans-serif', marginBottom:6 }}>
                  <span style={{ width:5, height:5, background:'#22C55E', borderRadius:'50%', display:'inline-block' }} />
                  Back-office admin
                </div>
                <div style={{ fontWeight:700, fontSize:'1.4rem', color:'white', fontFamily:'system-ui,sans-serif', letterSpacing:'-0.3px' }}>Tableau de bord</div>
                <div style={{ color:'#6B7280', fontSize:'0.75rem', fontFamily:'system-ui,sans-serif', marginTop:2 }}>{user?.email}</div>
              </div>
            </div>
            <div style={{ display:'flex', gap:'0.8rem', alignItems:'center' }}>
              <span style={{ display:'inline-flex', alignItems:'center', gap:'0.4rem', background:'rgba(255,255,255,0.08)', color:'#D1D5DB', padding:'0.4rem 0.9rem', borderRadius:8, fontSize:'0.78rem', fontFamily:'system-ui,sans-serif' }}>
                <span style={{ width:6, height:6, borderRadius:'50%', background:'#22C55E', display:'inline-block' }} />
                Système opérationnel
              </span>
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
            {TABS.map(t => (
              <button key={t} onClick={() => setTab(t)}
                style={{ padding:'0.7rem 1.2rem', border:'none', background:'transparent', cursor:'pointer', fontSize:'0.95rem', fontWeight: tab===t ? 600 : 400, color: tab===t ? '#00875A' : '#6B7280', borderBottom: tab===t ? '2.5px solid #00875A' : '2.5px solid transparent', whiteSpace:'nowrap', fontFamily:'system-ui,sans-serif', transition:'all 0.15s', margin:'0.5rem 0.2rem 0' }}
                onMouseEnter={e => { if(tab!==t) e.currentTarget.style.color='#111827' }}
                onMouseLeave={e => { if(tab!==t) e.currentTarget.style.color='#6B7280' }}>
                {tab === t ? (
                  <span style={{ display:'inline-flex', alignItems:'center', gap:'0.35rem', background:'#E8F5F0', color:'#00875A', padding:'0.35rem 1rem', borderRadius:50, fontSize:'0.92rem', fontWeight:600, fontFamily:'system-ui,sans-serif' }}>
                    <span style={{ width:5, height:5, background:'#00875A', borderRadius:'50%', display:'inline-block' }} />
                    {t}
                  </span>
                ) : (
                  <span style={{ fontFamily:'system-ui,sans-serif', fontSize:'0.92rem' }}>{t}</span>
                )}
              </button>
            ))}
          </div>
        </div>

        <div style={{ maxWidth:1280, margin:'0 auto', padding:'2rem 3rem' }}>

          {error && <div style={{ background:'#FEF2F2', color:'#7F1D1D', padding:'0.7rem 1rem', borderRadius:8, marginBottom:'1rem', fontSize:'0.83rem', fontFamily:'system-ui,sans-serif', border:'1px solid #FECACA' }}>{error}</div>}
          {success && <div style={{ background:'#E8F5F0', color:'#00875A', padding:'0.7rem 1rem', borderRadius:8, marginBottom:'1rem', fontSize:'0.83rem', fontFamily:'system-ui,sans-serif', border:'1px solid #A7F3D0' }}>{success}</div>}

          {/* VUE GENERALE */}
          {tab === 'Vue générale' && (
            <div style={{ display:'flex', flexDirection:'column', gap:'1.5rem' }}>

              {/* Stats animées */}
              <div style={{ display:'grid', gridTemplateColumns:'repeat(6,1fr)', gap:'1rem' }}>
                {adminStats.map(({ val, label }) => (
                  <Card key={label}
                    style={{ padding:'1.5rem', textAlign:'center', transition:'transform 0.2s, box-shadow 0.2s' }}
                    onMouseEnter={e => { e.currentTarget.style.transform='translateY(-3px)'; e.currentTarget.style.boxShadow='0 8px 24px rgba(0,135,90,0.12)' }}
                    onMouseLeave={e => { e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.boxShadow='0 1px 3px rgba(0,0,0,0.04)' }}>
                    <div style={{ display:'inline-flex', alignItems:'center', justifyContent:'center', width:56, height:56, background:'#E8F5F0', borderRadius:14, marginBottom:'0.8rem' }}>
                      <span style={{ fontSize:'1.3rem', fontWeight:800, color:'#00875A', fontFamily:'system-ui,sans-serif', letterSpacing:'-0.5px' }}>
                        <AnimatedNumber value={loading ? 0 : val} />
                      </span>
                    </div>
                    <div style={{ fontSize:'0.78rem', color:'#374151', fontFamily:'system-ui,sans-serif', fontWeight:500 }}>{label}</div>
                  </Card>
                ))}
              </div>

              {/* Derniers inscrits */}
              <Card>
                <div style={{ padding:'1rem 1.5rem', borderBottom:'1px solid #F3F4F6', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                  <span style={{ fontWeight:600, fontSize:'0.9rem', color:'#111827', fontFamily:'system-ui,sans-serif' }}>Derniers inscrits</span>
                  <button onClick={() => setTab('Utilisateurs')} style={{ color:'#00875A', fontSize:'0.82rem', background:'none', border:'none', cursor:'pointer', fontFamily:'system-ui,sans-serif', fontWeight:500 }}>Voir tout →</button>
                </div>
                {loading ? <div style={{ padding:'1rem' }}><Loading /></div> :
                  utilisateurs.slice(0,5).map((u,i,arr) => (
                    <div key={u.id} style={{ padding:'1rem 1.5rem', borderBottom: i<arr.length-1 ? '1px solid #F9FAFB' : 'none', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                      <div style={{ display:'flex', alignItems:'center', gap:'0.8rem' }}>
                        <div style={{ width:36, height:36, borderRadius:'50%', background:'#E5E7EB', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:600, fontSize:'0.75rem', color:'#374151', fontFamily:'system-ui,sans-serif' }}>
                          {u.nom?.split(' ').map(n=>n[0]).join('') || 'U'}
                        </div>
                        <div>
                          <div style={{ fontWeight:600, color:'#111827', fontSize:'0.88rem', fontFamily:'system-ui,sans-serif' }}>{u.nom}</div>
                          <div style={{ fontSize:'0.73rem', color:'#6B7280', fontFamily:'system-ui,sans-serif' }}>{u.email}</div>
                        </div>
                      </div>
                      <div style={{ display:'flex', gap:'0.4rem' }}>
                        <Badge label={u.role} />
                        <Badge label={u.estActif ? 'actif' : 'bloqué'} />
                      </div>
                    </div>
                  ))
                }
              </Card>

              {/* Répartition + Activité */}
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem' }}>
                <Card style={{ padding:'1.5rem' }}>
                  <div style={{ fontWeight:600, fontSize:'0.9rem', color:'#111827', marginBottom:'1.2rem', fontFamily:'system-ui,sans-serif' }}>Répartition</div>
                  {[['Clients', clients.length], ['Conducteurs', conducteurs.length], ['Bloqués', bloques.length]].map(([label, val]) => {
                    const pct = utilisateurs.length > 0 ? Math.round((val/utilisateurs.length)*100) : 0
                    return (
                      <div key={label} style={{ marginBottom:'0.9rem' }}>
                        <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
                          <span style={{ fontSize:'0.83rem', color:'#374151', fontFamily:'system-ui,sans-serif', fontWeight:500 }}>{label}</span>
                          <span style={{ fontSize:'0.78rem', color:'#6B7280', fontFamily:'system-ui,sans-serif' }}>{val} ({pct}%)</span>
                        </div>
                        <div style={{ background:'#E5E7EB', borderRadius:20, height:6 }}>
                          <div style={{ background:'#00875A', borderRadius:20, height:6, width:`${pct}%`, transition:'width 0.5s' }} />
                        </div>
                      </div>
                    )
                  })}
                </Card>

                <Card style={{ padding:'1.5rem' }}>
                  <div style={{ fontWeight:600, fontSize:'0.9rem', color:'#111827', marginBottom:'1.2rem', fontFamily:'system-ui,sans-serif' }}>Activité</div>
                  {[['Réservations', stats?.totalReservations ?? 0], ['Colis', stats?.totalColis ?? 0], ['Trajets', stats?.totalTrajets ?? 0]].map(([label, val]) => (
                    <div key={label} style={{ display:'flex', justifyContent:'space-between', padding:'0.7rem 0', borderBottom:'1px solid #F9FAFB' }}>
                      <span style={{ fontSize:'0.85rem', color:'#374151', fontFamily:'system-ui,sans-serif', fontWeight:500 }}>{label}</span>
                      <span style={{ fontWeight:700, fontSize:'1rem', color:'#00875A', fontFamily:'system-ui,sans-serif' }}>{loading ? '—' : val}</span>
                    </div>
                  ))}
                </Card>
              </div>
            </div>
          )}

          {/* UTILISATEURS */}
          {tab === 'Utilisateurs' && (
            <div style={{ display:'flex', flexDirection:'column', gap:'0.8rem' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:'1rem', marginBottom:'0.5rem' }}>
                <span style={{ fontWeight:600, fontSize:'0.95rem', color:'#111827', fontFamily:'system-ui,sans-serif' }}>
                  Utilisateurs <span style={{ fontWeight:400, color:'#6B7280' }}>({utilisateurs.length})</span>
                </span>
                <input placeholder="Rechercher..."
                  value={search} onChange={e => setSearch(e.target.value)}
                  style={{ padding:'0.6rem 0.9rem', border:'1px solid #D1D5DB', borderRadius:8, fontSize:'0.85rem', outline:'none', fontFamily:'system-ui,sans-serif', minWidth:220, color:'#111827' }} />
              </div>

              {loading ? <Loading /> :
                utilisateursFiltres.map(u => (
                  <Card key={u.id} style={{ padding:'1rem 1.5rem', display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:'0.8rem', transition:'box-shadow 0.2s' }}
                    onMouseEnter={e => e.currentTarget.style.boxShadow='0 4px 16px rgba(0,0,0,0.08)'}
                    onMouseLeave={e => e.currentTarget.style.boxShadow='0 1px 3px rgba(0,0,0,0.04)'}>
                    <div style={{ display:'flex', alignItems:'center', gap:'0.8rem' }}>
                      <div style={{ width:40, height:40, borderRadius:'50%', background:'#E5E7EB', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:600, fontSize:'0.8rem', color:'#374151', fontFamily:'system-ui,sans-serif' }}>
                        {u.nom?.split(' ').map(n=>n[0]).join('') || 'U'}
                      </div>
                      <div>
                        <div style={{ fontWeight:600, color:'#111827', fontSize:'0.9rem', fontFamily:'system-ui,sans-serif' }}>{u.nom}</div>
                        <div style={{ fontSize:'0.75rem', color:'#6B7280', fontFamily:'system-ui,sans-serif' }}>{u.email}</div>
                        <div style={{ display:'flex', gap:'0.3rem', marginTop:4 }}>
                          <Badge label={u.role} />
                          <Badge label={u.estActif ? 'actif' : 'bloqué'} />
                        </div>
                      </div>
                    </div>
                    <div>
                      {u.estActif ? (
                        <button onClick={() => handleBloquer(u.id)}
                          style={{ background:'#FEE2E2', color:'#7F1D1D', border:'none', borderRadius:8, padding:'0.45rem 1.1rem', fontSize:'0.82rem', fontWeight:600, cursor:'pointer', fontFamily:'system-ui,sans-serif', transition:'background 0.15s' }}>
                          Bloquer
                        </button>
                      ) : (
                        <button onClick={() => handleDebloquer(u.id)}
                          style={{ background:'#E8F5F0', color:'#00875A', border:'none', borderRadius:8, padding:'0.45rem 1.1rem', fontSize:'0.82rem', fontWeight:600, cursor:'pointer', fontFamily:'system-ui,sans-serif', transition:'background 0.15s' }}>
                          Débloquer
                        </button>
                      )}
                    </div>
                  </Card>
                ))
              }
            </div>
          )}

          {/* DOCUMENTS */}
          {tab === 'Documents' && (
            <div style={{ display:'flex', flexDirection:'column', gap:'1.2rem' }}>
              <div style={{ fontWeight:600, fontSize:'0.95rem', color:'#111827', fontFamily:'system-ui,sans-serif' }}>
                Documents en attente <span style={{ fontWeight:400, color:'#6B7280' }}>({documents.length})</span>
              </div>

              {loading ? <Loading /> :
                documents.length === 0 ? (
                  <Card style={{ padding:'3rem', textAlign:'center' }}>
                    <div style={{ fontWeight:500, color:'#374151', fontFamily:'system-ui,sans-serif' }}>Aucun document en attente</div>
                  </Card>
                ) : documents.map(d => (
                  <Card key={d.id} style={{ padding:'1.5rem' }}>
                    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'1.2rem', flexWrap:'wrap', gap:'1rem' }}>
                      <div style={{ display:'flex', alignItems:'center', gap:'0.8rem' }}>
                        <div style={{ width:48, height:48, borderRadius:'50%', overflow:'hidden', border:'2px solid #E8F5F0', flexShrink:0, boxShadow:'0 0 0 3px rgba(0,135,90,0.1)' }}>
                          {d.photoProfile ? (
                            <img src={`http://localhost:8080/api/documents/fichier/${d.photoProfile}`}
                              alt={d.nom} style={{ width:'100%', height:'100%', objectFit:'cover' }}
                              onError={e => e.target.style.display='none'} />
                          ) : (
                            <div style={{ width:'100%', height:'100%', background:'#E5E7EB', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:600, fontSize:'0.9rem', color:'#374151', fontFamily:'system-ui,sans-serif' }}>
                              {d.nom?.split(' ').map(n=>n[0]).join('') || 'C'}
                            </div>
                          )}
                        </div>
                        <div>
                          <div style={{ fontWeight:700, fontSize:'0.95rem', color:'#111827', fontFamily:'system-ui,sans-serif' }}>{d.nom}</div>
                          <div style={{ fontSize:'0.75rem', color:'#6B7280', fontFamily:'system-ui,sans-serif' }}>{d.email}</div>
                          {d.marqueVoiture && (
                            <div style={{ display:'inline-flex', alignItems:'center', gap:'0.3rem', background:'#DBEAFE', color:'#1E3A8A', padding:'0.15rem 0.6rem', borderRadius:20, fontSize:'0.72rem', fontWeight:600, marginTop:4, fontFamily:'system-ui,sans-serif' }}>
                              {d.marqueVoiture}
                            </div>
                          )}
                        </div>
                      </div>
                      <div style={{ display:'flex', gap:'0.6rem' }}>
                        <button onClick={() => handleValiderDoc(d.id)}
                          style={{ ...btnStyle('#00875A') }}
                          onMouseEnter={e => { e.currentTarget.style.background='#005C3E'; e.currentTarget.style.transform='translateY(-1px)' }}
                          onMouseLeave={e => { e.currentTarget.style.background='#00875A'; e.currentTarget.style.transform='translateY(0)' }}>
                          Valider
                        </button>
                        <button onClick={() => handleRejeterDoc(d.id)}
                          style={{ background:'#FEE2E2', color:'#7F1D1D', border:'none', borderRadius:8, padding:'0.55rem 1.2rem', fontSize:'0.83rem', fontWeight:600, cursor:'pointer', fontFamily:'system-ui,sans-serif', transition:'all 0.2s' }}
                          onMouseEnter={e => { e.currentTarget.style.background='#FECACA'; e.currentTarget.style.transform='translateY(-1px)' }}
                          onMouseLeave={e => { e.currentTarget.style.background='#FEE2E2'; e.currentTarget.style.transform='translateY(0)' }}>
                          Rejeter
                        </button>
                      </div>
                    </div>

                    <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(160px, 1fr))', gap:'0.8rem' }}>
                      {[
                        [d.permisConduire, 'Permis'],
                        [d.pieceIdentite, 'CIN'],
                        [d.photoVoiture, 'Véhicule'],
                      ].map(([fichier, label]) => (
                        fichier ? (
                          <div key={label} style={{ borderRadius:10, overflow:'hidden', border:'1px solid #E5E7EB', transition:'box-shadow 0.2s' }}
                            onMouseEnter={e => e.currentTarget.style.boxShadow='0 4px 12px rgba(0,0,0,0.1)'}
                            onMouseLeave={e => e.currentTarget.style.boxShadow='none'}>
                            <div style={{ background:'#F9FAFB', padding:'0.4rem 0.8rem', borderBottom:'1px solid #E5E7EB' }}>
                              <span style={{ fontSize:'0.7rem', fontWeight:600, color:'#374151', textTransform:'uppercase', fontFamily:'system-ui,sans-serif' }}>{label}</span>
                            </div>
                            <a href={`http://localhost:8080/api/documents/fichier/${fichier}`} target="_blank" rel="noreferrer">
                              <img src={`http://localhost:8080/api/documents/fichier/${fichier}`}
                                alt={label} style={{ width:'100%', height:130, objectFit:'cover', display:'block' }}
                                onError={e => e.target.style.display='none'} />
                            </a>
                            <div style={{ padding:'0.3rem 0.8rem', background:'#F9FAFB', fontSize:'0.7rem', color:'#9CA3AF', fontFamily:'system-ui,sans-serif' }}>
                              Cliquer pour agrandir
                            </div>
                          </div>
                        ) : (
                          <div key={label} style={{ borderRadius:10, border:'1px dashed #D1D5DB', height:170, display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', gap:'0.4rem' }}>
                            <div style={{ fontSize:'0.78rem', color:'#9CA3AF', fontFamily:'system-ui,sans-serif' }}>{label} non soumis</div>
                          </div>
                        )
                      ))}
                    </div>

                    <div style={{ marginTop:'1rem', paddingTop:'1rem', borderTop:'1px solid #F3F4F6', display:'flex', alignItems:'center', gap:'0.5rem' }}>
                      <span style={{ fontSize:'0.73rem', color:'#6B7280', fontFamily:'system-ui,sans-serif' }}>Statut :</span>
                      <span style={{ background:'#FEF9C3', color:'#713F12', padding:'0.18rem 0.65rem', borderRadius:20, fontSize:'0.72rem', fontWeight:600, fontFamily:'system-ui,sans-serif' }}>
                        {d.statutVerification}
                      </span>
                    </div>
                  </Card>
                ))
              }
            </div>
          )}

          {/* LITIGES */}
          {tab === 'Litiges' && (
            <div style={{ display:'flex', flexDirection:'column', gap:'0.8rem' }}>
              <div style={{ fontWeight:600, fontSize:'0.95rem', color:'#111827', fontFamily:'system-ui,sans-serif', marginBottom:'0.5rem' }}>
                Litiges <span style={{ fontWeight:400, color:'#6B7280' }}>({litiges.filter(l=>l.statut==='OUVERT').length} ouverts)</span>
              </div>

              {loading ? <Loading /> :
                litiges.length === 0 ? (
                  <Card style={{ padding:'3rem', textAlign:'center' }}>
                    <div style={{ fontWeight:500, color:'#374151', fontFamily:'system-ui,sans-serif' }}>Aucun litige</div>
                  </Card>
                ) : litiges.map(l => (
                  <Card key={l.id} style={{ padding:'1.2rem 1.5rem', transition:'box-shadow 0.2s' }}
                    onMouseEnter={e => e.currentTarget.style.boxShadow='0 4px 16px rgba(0,0,0,0.08)'}
                    onMouseLeave={e => e.currentTarget.style.boxShadow='0 1px 3px rgba(0,0,0,0.04)'}>
                    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'1rem', flexWrap:'wrap', gap:'0.5rem' }}>
                      <span style={{ fontWeight:700, fontSize:'0.95rem', color:'#111827', fontFamily:'system-ui,sans-serif' }}>{l.type}</span>
                      <span style={{
                        background: l.statut==='OUVERT' ? '#FEE2E2' : l.statut==='EN_COURS' ? '#FEF9C3' : '#E8F5F0',
                        color: l.statut==='OUVERT' ? '#7F1D1D' : l.statut==='EN_COURS' ? '#713F12' : '#00875A',
                        padding:'0.2rem 0.7rem', borderRadius:20, fontSize:'0.72rem', fontWeight:600, fontFamily:'system-ui,sans-serif'
                      }}>{l.statut}</span>
                    </div>

                    {l.description && <p style={{ color:'#6B7280', fontSize:'0.85rem', marginBottom:'1rem', fontFamily:'system-ui,sans-serif' }}>{l.description}</p>}

                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.8rem', marginBottom:'1rem' }}>
                      {[['Plaignant', l.nomPlaignant], ['Accusé', l.nomAccuse]].map(([label, val]) => (
                        <div key={label} style={{ background:'#F9FAFB', borderRadius:8, padding:'0.8rem', border:'1px solid #F3F4F6' }}>
                          <div style={{ fontSize:'0.68rem', color:'#9CA3AF', marginBottom:3, textTransform:'uppercase', fontFamily:'system-ui,sans-serif', fontWeight:600 }}>{label}</div>
                          <div style={{ fontWeight:600, color:'#111827', fontSize:'0.88rem', fontFamily:'system-ui,sans-serif' }}>{val}</div>
                        </div>
                      ))}
                    </div>

                    {l.statut !== 'RESOLU' && (
                      <div style={{ display:'flex', gap:'0.6rem', flexWrap:'wrap' }}>
                        {l.statut === 'OUVERT' && (
                          <button onClick={() => handleEnCours(l.id)}
                            style={{ background:'#FEF9C3', color:'#713F12', border:'none', borderRadius:8, padding:'0.5rem 1.1rem', fontSize:'0.83rem', fontWeight:600, cursor:'pointer', fontFamily:'system-ui,sans-serif', transition:'background 0.15s' }}>
                            Mettre en cours
                          </button>
                        )}
                        <button onClick={() => handleResoudre(l.id)}
                          style={{ background:'#E8F5F0', color:'#00875A', border:'none', borderRadius:8, padding:'0.5rem 1.1rem', fontSize:'0.83rem', fontWeight:600, cursor:'pointer', fontFamily:'system-ui,sans-serif', transition:'background 0.15s' }}>
                          Marquer résolu
                        </button>
                      </div>
                    )}

                    {l.dateCreation && (
                      <div style={{ marginTop:'0.8rem', fontSize:'0.73rem', color:'#9CA3AF', fontFamily:'system-ui,sans-serif' }}>
                        Signalé le {new Date(l.dateCreation).toLocaleDateString('fr-FR')}
                        {l.dateResolution && ` · Résolu le ${new Date(l.dateResolution).toLocaleDateString('fr-FR')}`}
                      </div>
                    )}
                  </Card>
                ))
              }
            </div>
          )}

          {/* STATISTIQUES */}
          {tab === 'Statistiques' && (
            <div style={{ display:'flex', flexDirection:'column', gap:'1.2rem' }}>
              <div style={{ fontWeight:600, fontSize:'0.95rem', color:'#111827', fontFamily:'system-ui,sans-serif' }}>Statistiques</div>

              <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'1rem' }}>
                {[
                  ['Utilisateurs', stats?.totalUtilisateurs ?? 0, '#00875A'],
                  ['Trajets', stats?.totalTrajets ?? 0, '#111827'],
                  ['Réservations', stats?.totalReservations ?? 0, '#1E40AF'],
                  ['Colis', stats?.totalColis ?? 0, '#C2410C'],
                ].map(([label, val, color]) => (
                  <Card key={label}
                    style={{ padding:'1.5rem', textAlign:'center', transition:'transform 0.2s, box-shadow 0.2s', borderTop:`3px solid ${color}` }}
                    onMouseEnter={e => { e.currentTarget.style.transform='translateY(-3px)'; e.currentTarget.style.boxShadow='0 8px 24px rgba(0,0,0,0.1)' }}
                    onMouseLeave={e => { e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.boxShadow='0 1px 3px rgba(0,0,0,0.04)' }}>
                    <div style={{ display:'inline-flex', alignItems:'center', justifyContent:'center', width:52, height:52, background:'#F9FAFB', borderRadius:12, marginBottom:'0.8rem', border:`1px solid ${color}20` }}>
                      <span style={{ fontSize:'1.3rem', fontWeight:800, color, fontFamily:'system-ui,sans-serif' }}>
                        <AnimatedNumber value={loading ? 0 : val} />
                      </span>
                    </div>
                    <div style={{ fontSize:'0.8rem', color:'#374151', fontFamily:'system-ui,sans-serif', fontWeight:500 }}>{label}</div>
                  </Card>
                ))}
              </div>

              <Card style={{ padding:'1.5rem' }}>
                <div style={{ fontWeight:600, fontSize:'0.9rem', color:'#111827', marginBottom:'1.2rem', fontFamily:'system-ui,sans-serif' }}>Répartition des rôles</div>
                {[['Clients', clients.length, '#00875A'], ['Conducteurs', conducteurs.length, '#111827'], ['Bloqués', bloques.length, '#7F1D1D']].map(([label, val, color]) => {
                  const pct = utilisateurs.length > 0 ? Math.round((val/utilisateurs.length)*100) : 0
                  return (
                    <div key={label} style={{ marginBottom:'1rem' }}>
                      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
                        <span style={{ fontSize:'0.85rem', color:'#374151', fontFamily:'system-ui,sans-serif', fontWeight:500 }}>{label}</span>
                        <span style={{ fontSize:'0.8rem', color:'#6B7280', fontFamily:'system-ui,sans-serif' }}>{val} ({pct}%)</span>
                      </div>
                      <div style={{ background:'#E5E7EB', borderRadius:20, height:8 }}>
                        <div style={{ background:color, borderRadius:20, height:8, width:`${pct}%`, transition:'width 0.6s' }} />
                      </div>
                    </div>
                  )
                })}
              </Card>

              <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'1rem' }}>
                {[
                  ['Utilisateurs actifs', utilisateurs.filter(u=>u.estActif).length],
                  ["Taux d'activation", `${utilisateurs.length > 0 ? Math.round((utilisateurs.filter(u=>u.estActif).length/utilisateurs.length)*100) : 0}%`],
                  ['Conducteurs / Clients', `${conducteurs.length} / ${clients.length}`],
                  ['Comptes bloqués', bloques.length],
                ].map(([label, val]) => (
                  <Card key={label} style={{ padding:'1.2rem', textAlign:'center', transition:'transform 0.2s' }}
                    onMouseEnter={e => { e.currentTarget.style.transform='translateY(-2px)'; e.currentTarget.style.boxShadow='0 4px 12px rgba(0,135,90,0.1)' }}
                    onMouseLeave={e => { e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.boxShadow='0 1px 3px rgba(0,0,0,0.04)' }}>
                    <div style={{ display:'inline-flex', alignItems:'center', justifyContent:'center', width:48, height:48, background:'#E8F5F0', borderRadius:12, marginBottom:'0.6rem' }}>
                      <span style={{ fontSize:'1rem', fontWeight:800, color:'#00875A', fontFamily:'system-ui,sans-serif' }}>{val}</span>
                    </div>
                    <div style={{ fontSize:'0.75rem', color:'#374151', fontFamily:'system-ui,sans-serif', fontWeight:500 }}>{label}</div>
                  </Card>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
      <Footer />
    </>
  )
}