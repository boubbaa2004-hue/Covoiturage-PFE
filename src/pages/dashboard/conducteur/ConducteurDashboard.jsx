import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Header from '../../../components/layout/Header'
import Footer from '../../../components/layout/Footer'
import {
  getMesTrajets,
  creerTrajet,
  getMesNegociations,
  repondreNegociation,
  uploadDocuments,
  getUser,
  logout
} from '../../../lib/api'

const COLORS = {
  'ACTIF':      { bg:'#E8F5F0', color:'#005C3E' },
  'TERMINE':    { bg:'#F1F1F1', color:'#555' },
  'ANNULE':     { bg:'#FDEDED', color:'#C62828' },
  'EN_COURS':   { bg:'#FFF8E6', color:'#92610A' },
  'ACCEPTE':    { bg:'#E8F5F0', color:'#005C3E' },
  'REFUSE':     { bg:'#FDEDED', color:'#C62828' },
  'EN_ATTENTE': { bg:'#E6F1FB', color:'#185FA5' },
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

const TABS = ['Vue générale','Mes trajets','Négociations','Documents','Mon profil']

const emptyForm = {
  villeDepart:'', villeArrivee:'', dateHeure:'',
  placesDisponibles:'', prixParPlace:'', volumeCoffre:'', description:''
}

export default function ConducteurDashboard() {
  const navigate = useNavigate()
  const user = getUser()
  const userInfo = getUser()
  const estVerifie = userInfo?.estVerifie !== false
  
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
  const [docForm, setDocForm] = useState({
    permis: null, cin: null, photoVoiture: null,
    carteGrise: null, marqueVoiture: ''
  })
  const [docSuccess, setDocSuccess] = useState('')
  const [docLoading, setDocLoading] = useState(false)

  useEffect(() => { chargerDonnees() }, [])

  const chargerDonnees = async () => {
    setLoading(true)
    setError('')
    try {
      const [traj, neg] = await Promise.all([getMesTrajets(), getMesNegociations()])
      setTrajets(Array.isArray(traj) ? traj : [])
      setNegociations(Array.isArray(neg) ? neg : [])
    } catch (e) {
      setError('Erreur de chargement')
    } finally {
      setLoading(false)
    }
  }

  const handleCreerTrajet = async () => {
    if (!form.villeDepart || !form.villeArrivee || !form.dateHeure || !form.placesDisponibles || !form.prixParPlace) {
      setError('Veuillez remplir tous les champs obligatoires')
      return
    }
    setFormLoading(true)
    setError('')
    try {
      await creerTrajet({
        ...form,
        placesDisponibles: parseInt(form.placesDisponibles),
        prixParPlace: parseFloat(form.prixParPlace),
        volumeCoffre: form.volumeCoffre ? parseFloat(form.volumeCoffre) : null,
      })
      setSuccess('Trajet publié avec succès !')
      setShowForm(false)
      setForm(emptyForm)
      chargerDonnees()
      setTimeout(() => setSuccess(''), 3000)
    } catch (e) {
      setError('Erreur lors de la publication')
    } finally {
      setFormLoading(false)
    }
  }

  const handleRepondre = async (id, decision, offreContre) => {
    try {
      await repondreNegociation(id, decision, offreContre || null)
      chargerDonnees()
    } catch (e) {
      setError('Erreur lors de la réponse')
    }
  }

  const handleSoumettreDocuments = async () => {
    if (!docForm.permis || !docForm.cin || !docForm.photoVoiture) {
      setError('Le permis, la CIN et la photo du véhicule sont obligatoires')
      return
    }
    if (!docForm.marqueVoiture) {
      setError('Veuillez indiquer la marque du véhicule')
      return
    }
    setDocLoading(true)
    setError('')
    try {
      const formData = new FormData()
      formData.append('permis', docForm.permis)
      formData.append('cin', docForm.cin)
      formData.append('photoVoiture', docForm.photoVoiture)
      if (docForm.carteGrise) formData.append('carteGrise', docForm.carteGrise)
      formData.append('marqueVoiture', docForm.marqueVoiture)
      await uploadDocuments(formData)
      setDocSuccess('Documents soumis ! En attente de validation par l\'admin.')
      setDocForm({ permis:null, cin:null, photoVoiture:null, carteGrise:null, marqueVoiture:'' })
      setTimeout(() => setDocSuccess(''), 5000)
    } catch (e) {
      setError('Erreur lors de la soumission')
    } finally {
      setDocLoading(false)
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <>
      <Header />
      <div style={{ marginTop:108, background:'var(--gray)', minHeight:'100vh' }}>

        {/* Hero */}
        <div style={{ background:'linear-gradient(135deg,#0D1117 0%,#1C2434 100%)', padding:'2.5rem 3rem' }}>
          <div style={{ maxWidth:1280, margin:'0 auto', display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:'1rem' }}>
            <div style={{ display:'flex', alignItems:'center', gap:'1.2rem' }}>
              <div style={{ width:64, height:64, borderRadius:'50%', background:'var(--primary)', border:'3px solid rgba(255,255,255,0.2)', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'Bricolage Grotesque,sans-serif', fontWeight:800, fontSize:'1.5rem', color:'white' }}>
                {user?.nom?.split(' ').map(n=>n[0]).join('') || 'C'}
              </div>
              <div>
                <div style={{ display:'flex', alignItems:'center', gap:'0.6rem', marginBottom:4 }}>
                  <p style={{ color:'rgba(255,255,255,0.6)', fontSize:'0.82rem' }}>Espace conducteur 🚗</p>
                  <span style={{ background:'var(--primary)', color:'white', padding:'0.15rem 0.6rem', borderRadius:20, fontSize:'0.7rem', fontWeight:700 }}>Conducteur</span>
                </div>
                <h2 style={{ fontFamily:'Bricolage Grotesque,sans-serif', fontWeight:800, fontSize:'1.6rem', color:'white', marginBottom:3 }}>{user?.nom}</h2>
                <p style={{ color:'rgba(255,255,255,0.55)', fontSize:'0.82rem' }}>{user?.email}</p>
              </div>
            </div>
            <div style={{ display:'flex', gap:'0.8rem', flexWrap:'wrap' }}>
              <button
                onClick={() => estVerifie ? setShowForm(true) : null}
                style={{ background: estVerifie ? 'var(--primary)' : '#9CA3AF', color:'white', border:'none', borderRadius:10, padding:'0.8rem 2rem', fontWeight:700, fontSize:'0.95rem', cursor: estVerifie ? 'pointer' : 'not-allowed', fontFamily:'inherit', opacity: estVerifie ? 1 : 0.7 }}
                title={!estVerifie ? 'Compte non encore vérifié par l\'admin' : ''}>
                {estVerifie ? '+ Publier un trajet' : '🔒 En attente de validation'}
              </button>
              <button onClick={handleLogout}
                style={{ background:'rgba(255,255,255,0.1)', color:'white', border:'1.5px solid rgba(255,255,255,0.2)', borderRadius:10, padding:'0.8rem 1.5rem', fontWeight:600, fontSize:'0.9rem', cursor:'pointer', fontFamily:'inherit' }}>
                Déconnexion
              </button>
            </div>
          </div>
        </div>

        {/* Bandeau non vérifié */}
        {!estVerifie && (
          <div style={{ background:'#FFF8E6', borderLeft:'4px solid #F59E0B', padding:'1.2rem 2rem' }}>
            <div style={{ maxWidth:1280, margin:'0 auto', display:'flex', alignItems:'center', gap:'1rem' }}>
              <span style={{ fontSize:'1.5rem' }}>⏳</span>
              <div>
                <div style={{ fontWeight:700, color:'#92610A', marginBottom:2 }}>Compte en attente de validation</div>
                <div style={{ color:'#92610A', fontSize:'0.88rem' }}>Vos documents sont en cours de vérification. Vous pourrez publier des trajets une fois validé par l'administrateur.</div>
              </div>
            </div>
          </div>
        )}

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

        {/* Modal publier trajet */}
        {showForm && (
          <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center', padding:'1rem' }}>
            <Card style={{ padding:'2rem', width:'100%', maxWidth:500, maxHeight:'90vh', overflowY:'auto' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.5rem' }}>
                <h3 style={{ fontFamily:'Bricolage Grotesque,sans-serif', fontWeight:800, fontSize:'1.2rem' }}>Publier un trajet</h3>
                <button onClick={() => { setShowForm(false); setError('') }} style={{ background:'none', border:'none', fontSize:'1.3rem', cursor:'pointer', color:'var(--muted)' }}>✕</button>
              </div>
              {error && (
                <div style={{ background:'#FDEDED', color:'#C62828', padding:'0.8rem', borderRadius:8, fontSize:'0.85rem', marginBottom:'1rem', fontWeight:600 }}>❌ {error}</div>
              )}
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem' }}>
                {[['Ville de départ *','text','villeDepart','Ex: Béni Mellal'],["Ville d'arrivée *",'text','villeArrivee','Ex: Casablanca']].map(([label,type,key,placeholder]) => (
                  <div key={key}>
                    <label style={{ fontSize:'0.75rem', fontWeight:700, color:'var(--muted)', textTransform:'uppercase', letterSpacing:'0.5px', display:'block', marginBottom:'0.4rem' }}>{label}</label>
                    <input type={type} placeholder={placeholder} value={form[key]} onChange={e => setForm({...form, [key]: e.target.value})} style={{ width:'100%', padding:'0.8rem 1rem', border:'1.5px solid var(--border)', borderRadius:8, fontSize:'0.92rem', outline:'none', fontFamily:'inherit' }} />
                  </div>
                ))}
              </div>
              <div style={{ marginTop:'1rem' }}>
                {[['Date et heure *','datetime-local','dateHeure',''],['Nombre de places *','number','placesDisponibles','4'],['Prix par place (MAD) *','number','prixParPlace','80'],['Volume coffre (kg)','number','volumeCoffre','20'],['Description','text','description','Informations...']].map(([label,type,key,placeholder]) => (
                  <div key={key} style={{ marginBottom:'1rem' }}>
                    <label style={{ fontSize:'0.75rem', fontWeight:700, color:'var(--muted)', textTransform:'uppercase', letterSpacing:'0.5px', display:'block', marginBottom:'0.4rem' }}>{label}</label>
                    <input type={type} placeholder={placeholder} value={form[key]} onChange={e => setForm({...form, [key]: e.target.value})} style={{ width:'100%', padding:'0.8rem 1rem', border:'1.5px solid var(--border)', borderRadius:8, fontSize:'0.92rem', outline:'none', fontFamily:'inherit' }} />
                  </div>
                ))}
              </div>
              <button onClick={handleCreerTrajet} disabled={formLoading}
                style={{ width:'100%', padding:'1rem', background: formLoading ? 'var(--muted)' : 'var(--primary)', color:'white', border:'none', borderRadius:10, fontSize:'1rem', fontWeight:700, cursor: formLoading ? 'not-allowed' : 'pointer', fontFamily:'inherit' }}>
                {formLoading ? 'Publication...' : '🚗 Publier le trajet'}
              </button>
            </Card>
          </div>
        )}

        <div style={{ maxWidth:1280, margin:'0 auto', padding:'2.5rem 3rem' }}>

          {error && !showForm && (
            <div style={{ background:'#FDEDED', color:'#C62828', padding:'1rem', borderRadius:10, marginBottom:'1.5rem', fontWeight:600 }}>❌ {error}</div>
          )}
          {success && (
            <div style={{ background:'#E8F5F0', color:'#005C3E', padding:'1rem', borderRadius:10, marginBottom:'1.5rem', fontWeight:600 }}>✅ {success}</div>
          )}

          {/* VUE GÉNÉRALE */}
          {tab === 'Vue générale' && (
            <div style={{ display:'flex', flexDirection:'column', gap:'1.5rem' }}>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))', gap:'1rem' }}>
                {[['🚗', trajets.length, 'Trajets publiés'],['✅', trajets.filter(t=>t.statut==='ACTIF').length, 'Trajets actifs'],['💬', negociations.filter(n=>n.statut==='EN_COURS').length, 'Négociations actives'],['💰', trajets.reduce((acc,t) => acc + (t.prixParPlace || 0), 0) + ' MAD', 'Volume total']].map(([ico,val,label]) => (
                  <Card key={label} style={{ padding:'1.5rem', textAlign:'center' }}>
                    <div style={{ fontSize:'1.6rem', marginBottom:'0.6rem' }}>{ico}</div>
                    <div style={{ fontFamily:'Bricolage Grotesque,sans-serif', fontSize:'1.7rem', fontWeight:800, color:'var(--dark)', lineHeight:1 }}>{val}</div>
                    <div style={{ fontSize:'0.78rem', color:'var(--muted)', marginTop:5 }}>{label}</div>
                  </Card>
                ))}
              </div>

              <Card>
                <div style={{ padding:'1.2rem 1.5rem', borderBottom:'1px solid var(--border)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                  <h3 style={{ fontFamily:'Bricolage Grotesque,sans-serif', fontWeight:700, fontSize:'1rem' }}>Mes derniers trajets</h3>
                  <button onClick={() => setTab('Mes trajets')} style={{ color:'var(--primary)', fontSize:'0.82rem', fontWeight:600, background:'none', border:'none', cursor:'pointer' }}>Voir tout →</button>
                </div>
                {loading ? <div style={{ padding:'1.5rem' }}><Loading /></div> :
                  trajets.length === 0 ? (
                    <div style={{ padding:'2rem', textAlign:'center', color:'var(--muted)', fontSize:'0.88rem' }}>
                      Aucun trajet publié.
                      <br />
                      <button onClick={() => setShowForm(true)} style={{ color:'var(--primary)', fontWeight:600, background:'none', border:'none', cursor:'pointer', marginTop:8 }}>Publier mon premier trajet →</button>
                    </div>
                  ) : trajets.slice(0,3).map((t,i,arr) => (
                    <div key={t.id} style={{ padding:'1rem 1.5rem', borderBottom: i<arr.length-1 ? '1px solid var(--border)' : 'none', display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:'0.5rem' }}>
                      <div>
                        <div style={{ fontWeight:600, color:'var(--dark)' }}>{t.villeDepart} → {t.villeArrivee}</div>
                        <div style={{ fontSize:'0.8rem', color:'var(--muted)', marginTop:2 }}>📅 {new Date(t.dateHeure).toLocaleDateString('fr-FR')} · 💺 {t.placesDisponibles} place(s)</div>
                      </div>
                      <div style={{ display:'flex', alignItems:'center', gap:'0.8rem' }}>
                        <span style={{ fontFamily:'Bricolage Grotesque,sans-serif', fontWeight:800 }}>{t.prixParPlace} MAD</span>
                        <Badge statut={t.statut} />
                      </div>
                    </div>
                  ))
                }
              </Card>

              <Card>
                <div style={{ padding:'1.2rem 1.5rem', borderBottom:'1px solid var(--border)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                  <h3 style={{ fontFamily:'Bricolage Grotesque,sans-serif', fontWeight:700, fontSize:'1rem' }}>Négociations en cours</h3>
                  <button onClick={() => setTab('Négociations')} style={{ color:'var(--primary)', fontSize:'0.82rem', fontWeight:600, background:'none', border:'none', cursor:'pointer' }}>Voir tout →</button>
                </div>
                {loading ? <div style={{ padding:'1.5rem' }}><Loading /></div> :
                  negociations.filter(n=>n.statut==='EN_COURS').length === 0 ? (
                    <div style={{ padding:'2rem', textAlign:'center', color:'var(--muted)', fontSize:'0.88rem' }}>Aucune négociation en cours.</div>
                  ) : negociations.filter(n=>n.statut==='EN_COURS').slice(0,2).map((n,i,arr) => (
                    <div key={n.id} style={{ padding:'1rem 1.5rem', borderBottom: i<arr.length-1 ? '1px solid var(--border)' : 'none', display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:'0.5rem' }}>
                      <div>
                        <div style={{ fontWeight:600, color:'var(--dark)' }}>👤 {n.nomClient} · {n.villeDepart} → {n.villeArrivee}</div>
                        <div style={{ fontSize:'0.8rem', color:'var(--muted)', marginTop:2 }}>Offre : {n.offreClient} MAD</div>
                      </div>
                      <div style={{ display:'flex', gap:'0.5rem' }}>
                        <button onClick={() => handleRepondre(n.id, 'ACCEPTE', null)} style={{ background:'var(--primary-light)', color:'var(--primary)', border:'none', borderRadius:8, padding:'0.3rem 0.8rem', fontSize:'0.8rem', fontWeight:600, cursor:'pointer', fontFamily:'inherit' }}>✓ Accepter</button>
                        <button onClick={() => handleRepondre(n.id, 'REFUSE', null)} style={{ background:'#FDEDED', color:'#C62828', border:'none', borderRadius:8, padding:'0.3rem 0.8rem', fontSize:'0.8rem', fontWeight:600, cursor:'pointer', fontFamily:'inherit' }}>✕ Refuser</button>
                      </div>
                    </div>
                  ))
                }
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
              {loading ? <Loading /> :
                trajets.length === 0 ? (
                  <Card style={{ padding:'3rem', textAlign:'center' }}>
                    <div style={{ fontSize:'3rem', marginBottom:'1rem' }}>🚗</div>
                    <h3 style={{ fontFamily:'Bricolage Grotesque,sans-serif', fontWeight:800, marginBottom:'0.5rem' }}>Aucun trajet publié</h3>
                    <p style={{ color:'var(--muted)', marginBottom:'1.5rem' }}>Publiez votre premier trajet et commencez à gagner.</p>
                    <button onClick={() => setShowForm(true)} style={{ background:'var(--primary)', color:'white', border:'none', borderRadius:10, padding:'0.8rem 2rem', fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}>Publier un trajet</button>
                  </Card>
                ) : trajets.map(t => (
                  <Card key={t.id} style={{ padding:'1.5rem', display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:'1rem' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:'1rem' }}>
                      <div style={{ width:48, height:48, background:'var(--primary-light)', borderRadius:12, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.4rem' }}>🚗</div>
                      <div>
                        <div style={{ fontFamily:'Bricolage Grotesque,sans-serif', fontWeight:700, fontSize:'1.05rem', color:'var(--dark)' }}>{t.villeDepart} → {t.villeArrivee}</div>
                        <div style={{ fontSize:'0.82rem', color:'var(--muted)', marginTop:3 }}>📅 {new Date(t.dateHeure).toLocaleDateString('fr-FR')} · ⏰ {new Date(t.dateHeure).toLocaleTimeString('fr-FR', {hour:'2-digit',minute:'2-digit'})} · 💺 {t.placesDisponibles} place(s)</div>
                      </div>
                    </div>
                    <div style={{ display:'flex', alignItems:'center', gap:'0.8rem', flexWrap:'wrap' }}>
                      <span style={{ fontFamily:'Bricolage Grotesque,sans-serif', fontSize:'1.2rem', fontWeight:800 }}>{t.prixParPlace} MAD</span>
                      <Badge statut={t.statut} />
                    </div>
                  </Card>
                ))
              }
            </div>
          )}

          {/* NÉGOCIATIONS */}
          {tab === 'Négociations' && (
            <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
              <h2 style={{ fontFamily:'Bricolage Grotesque,sans-serif', fontSize:'1.5rem', fontWeight:800, color:'var(--dark)' }}>Négociations reçues</h2>
              {loading ? <Loading /> :
                negociations.length === 0 ? (
                  <Card style={{ padding:'3rem', textAlign:'center' }}>
                    <div style={{ fontSize:'3rem', marginBottom:'1rem' }}>💬</div>
                    <h3 style={{ fontFamily:'Bricolage Grotesque,sans-serif', fontWeight:800, marginBottom:'0.5rem' }}>Aucune négociation</h3>
                    <p style={{ color:'var(--muted)' }}>Les clients peuvent négocier le tarif de vos trajets.</p>
                  </Card>
                ) : negociations.map(n => (
                  <Card key={n.id} style={{ padding:'1.5rem' }}>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1rem', flexWrap:'wrap', gap:'0.5rem' }}>
                      <div>
                        <div style={{ fontFamily:'Bricolage Grotesque,sans-serif', fontWeight:700, fontSize:'1.05rem' }}>👤 {n.nomClient}</div>
                        <div style={{ fontSize:'0.82rem', color:'var(--muted)', marginTop:2 }}>🚗 {n.villeDepart} → {n.villeArrivee}</div>
                      </div>
                      <Badge statut={n.statut} />
                    </div>
                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem', marginBottom: n.statut==='EN_COURS' ? '1.2rem' : 0 }}>
                      <div style={{ background:'var(--primary-light)', borderRadius:12, padding:'1rem', textAlign:'center' }}>
                        <div style={{ fontSize:'0.73rem', color:'var(--primary)', fontWeight:700, marginBottom:6, textTransform:'uppercase' }}>Offre client</div>
                        <div style={{ fontFamily:'Bricolage Grotesque,sans-serif', fontSize:'1.5rem', fontWeight:800, color:'var(--primary)' }}>{n.offreClient} MAD</div>
                      </div>
                      <div style={{ background:'var(--gray)', borderRadius:12, padding:'1rem', textAlign:'center' }}>
                        <div style={{ fontSize:'0.73rem', color:'var(--muted)', fontWeight:700, marginBottom:6, textTransform:'uppercase' }}>Ma contre-offre</div>
                        <div style={{ fontFamily:'Bricolage Grotesque,sans-serif', fontSize:'1.5rem', fontWeight:800, color:'var(--dark)' }}>{n.offreConducteur ? `${n.offreConducteur} MAD` : '—'}</div>
                      </div>
                    </div>
                    {n.statut === 'EN_COURS' && (
                      <div style={{ display:'flex', gap:'0.8rem', flexWrap:'wrap' }}>
                        <button onClick={() => handleRepondre(n.id, 'ACCEPTE', null)} style={{ background:'var(--primary-light)', color:'var(--primary)', border:'none', borderRadius:8, padding:'0.75rem 1.4rem', fontWeight:700, fontSize:'0.88rem', cursor:'pointer', fontFamily:'inherit' }}>✓ Accepter {n.offreClient} MAD</button>
                        <input type="number" placeholder="Contre-offre MAD" value={contre} onChange={e => setContre(e.target.value)} style={{ flex:1, minWidth:140, padding:'0.75rem 1rem', border:'1.5px solid var(--border)', borderRadius:8, fontSize:'0.92rem', outline:'none', fontFamily:'inherit' }} />
                        <button onClick={() => { handleRepondre(n.id, 'CONTRE', parseFloat(contre)); setContre('') }} style={{ background:'var(--dark)', color:'white', border:'none', borderRadius:8, padding:'0.75rem 1.3rem', fontWeight:700, fontSize:'0.88rem', cursor:'pointer', fontFamily:'inherit' }}>Contre-proposer</button>
                        <button onClick={() => handleRepondre(n.id, 'REFUSE', null)} style={{ background:'#FDEDED', color:'#C62828', border:'none', borderRadius:8, padding:'0.75rem 1.2rem', fontWeight:700, fontSize:'0.88rem', cursor:'pointer', fontFamily:'inherit' }}>✕ Refuser</button>
                      </div>
                    )}
                  </Card>
                ))
              }
            </div>
          )}

          {/* DOCUMENTS */}
          {tab === 'Documents' && (
            <div style={{ maxWidth:620 }}>
              <h2 style={{ fontFamily:'Bricolage Grotesque,sans-serif', fontSize:'1.5rem', fontWeight:800, color:'var(--dark)', marginBottom:'1.5rem' }}>Soumettre mes documents</h2>

              {docSuccess && <div style={{ background:'#E8F5F0', color:'#005C3E', padding:'1rem', borderRadius:10, marginBottom:'1.5rem', fontWeight:600 }}>✅ {docSuccess}</div>}
              {error && <div style={{ background:'#FDEDED', color:'#C62828', padding:'1rem', borderRadius:10, marginBottom:'1.5rem', fontWeight:600 }}>❌ {error}</div>}

              <div style={{ background:'white', borderRadius:16, border:'1px solid var(--border)', padding:'2rem' }}>
                <div style={{ background:'#FFF8E6', borderRadius:10, padding:'1rem', marginBottom:'1.5rem', display:'flex', gap:'0.8rem' }}>
                  <span style={{ fontSize:'1.2rem' }}>📋</span>
                  <div>
                    <div style={{ fontWeight:700, color:'#92610A', fontSize:'0.88rem', marginBottom:2 }}>Documents requis</div>
                    <div style={{ color:'#92610A', fontSize:'0.82rem' }}>Photos JPG/PNG pour permis, CIN et voiture. PDF pour carte grise. Une fois validé, vous pourrez publier des trajets.</div>
                  </div>
                </div>

                <div style={{ marginBottom:'1.2rem' }}>
                  <label style={{ fontSize:'0.75rem', fontWeight:700, color:'var(--muted)', textTransform:'uppercase', letterSpacing:'0.5px', display:'block', marginBottom:'0.4rem' }}>Marque et modèle du véhicule *</label>
                  <input type="text" placeholder="Ex: Toyota Corolla 2020" value={docForm.marqueVoiture || ''}
                    onChange={e => setDocForm({...docForm, marqueVoiture: e.target.value})}
                    style={{ width:'100%', padding:'0.85rem 1rem', border:'1.5px solid var(--border)', borderRadius:10, fontSize:'0.92rem', outline:'none', fontFamily:'inherit' }} />
                </div>

                {[
                  ['permis', '📷 Photo Permis de conduire *', 'JPG ou PNG', 'image/*'],
                  ['cin', '📷 Photo Pièce d\'identité (CIN) *', 'JPG ou PNG', 'image/*'],
                  ['photoVoiture', '📷 Photo du véhicule *', 'JPG ou PNG', 'image/*'],
                  ['carteGrise', '📄 Carte grise (optionnel)', 'PDF', '.pdf'],
                ].map(([key, label, hint, accept]) => (
                  <div key={key} style={{ marginBottom:'1.2rem' }}>
                    <label style={{ fontSize:'0.75rem', fontWeight:700, color:'var(--muted)', textTransform:'uppercase', letterSpacing:'0.5px', display:'block', marginBottom:'0.4rem' }}>{label}</label>
                    <div onClick={() => document.getElementById(`file-${key}`).click()}
                      style={{ border:'2px dashed var(--border)', borderRadius:10, padding:'1.2rem', textAlign:'center', background:'var(--gray)', cursor:'pointer' }}
                      onMouseEnter={e => e.currentTarget.style.borderColor='var(--primary)'}
                      onMouseLeave={e => e.currentTarget.style.borderColor='var(--border)'}>
                      <input id={`file-${key}`} type="file" accept={accept} style={{ display:'none' }}
                        onChange={e => setDocForm({...docForm, [key]: e.target.files[0]})} />
                      {docForm[key] ? (
                        <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:'0.8rem', flexWrap:'wrap' }}>
                          {docForm[key].type?.startsWith('image/') && (
                            <img src={URL.createObjectURL(docForm[key])} alt="preview"
                              style={{ width:60, height:60, objectFit:'cover', borderRadius:8, border:'2px solid var(--primary)' }} />
                          )}
                          {docForm[key].type === 'application/pdf' && <span style={{ fontSize:'2rem' }}>📄</span>}
                          <div>
                            <div style={{ fontSize:'0.88rem', fontWeight:600, color:'var(--primary)' }}>{docForm[key].name}</div>
                            <div style={{ fontSize:'0.75rem', color:'var(--muted)' }}>{(docForm[key].size / 1024).toFixed(0)} KB</div>
                          </div>
                          <button onClick={e => { e.stopPropagation(); setDocForm({...docForm, [key]: null}) }}
                            style={{ background:'#FDEDED', border:'none', color:'#C62828', cursor:'pointer', fontSize:'0.8rem', fontWeight:700, padding:'0.3rem 0.6rem', borderRadius:6 }}>
                            ✕
                          </button>
                        </div>
                      ) : (
                        <div>
                          <div style={{ fontSize:'2rem', marginBottom:'0.4rem' }}>{accept === '.pdf' ? '📄' : '📷'}</div>
                          <p style={{ color:'var(--muted)', fontSize:'0.85rem', margin:0 }}>{hint}</p>
                          <p style={{ color:'var(--primary)', fontSize:'0.8rem', fontWeight:600, margin:'0.3rem 0 0' }}>Cliquer pour sélectionner</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                <button onClick={handleSoumettreDocuments} disabled={docLoading}
                  style={{ width:'100%', padding:'1rem', background: docLoading ? 'var(--muted)' : 'var(--primary)', color:'white', border:'none', borderRadius:10, fontSize:'1rem', fontWeight:700, cursor: docLoading ? 'not-allowed' : 'pointer', fontFamily:'inherit', marginTop:'0.5rem' }}>
                  {docLoading ? '⏳ Envoi en cours...' : '📤 Soumettre mes documents'}
                </button>
              </div>
            </div>
          )}

          {/* MON PROFIL */}
          {tab === 'Mon profil' && (
            <div style={{ maxWidth:600 }}>
              <h2 style={{ fontFamily:'Bricolage Grotesque,sans-serif', fontSize:'1.5rem', fontWeight:800, color:'var(--dark)', marginBottom:'1.5rem' }}>Mon profil conducteur</h2>
              <Card style={{ padding:'2rem' }}>
                <div style={{ display:'flex', alignItems:'center', gap:'1.5rem', marginBottom:'2rem', paddingBottom:'2rem', borderBottom:'1px solid var(--border)' }}>
                  <div style={{ width:72, height:72, borderRadius:'50%', background:'var(--dark)', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'Bricolage Grotesque,sans-serif', fontWeight:800, fontSize:'1.8rem', color:'white' }}>
                    {user?.nom?.split(' ').map(n=>n[0]).join('') || 'C'}
                  </div>
                  <div>
                    <div style={{ fontFamily:'Bricolage Grotesque,sans-serif', fontWeight:800, fontSize:'1.2rem', color:'var(--dark)' }}>{user?.nom}</div>
                    <div style={{ fontSize:'0.82rem', color:'var(--muted)', marginTop:3 }}>{user?.email}</div>
                    <span style={{ background: estVerifie ? 'var(--primary-light)' : '#FFF8E6', color: estVerifie ? 'var(--primary)' : '#92610A', padding:'0.2rem 0.8rem', borderRadius:20, fontSize:'0.72rem', fontWeight:700, display:'inline-block', marginTop:6 }}>
                      {estVerifie ? '✓ Conducteur vérifié' : '⏳ En attente de validation'}
                    </span>
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