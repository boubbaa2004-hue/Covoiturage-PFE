import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../../components/layout/Header'
import Footer from '../../components/layout/Footer'
import { getTrajets, getUser, getToken } from '../../lib/api'

export default function TrajetsPage() {
  const user = getUser()
  const navigate = useNavigate()
  const [trajets, setTrajets] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState({ depart:'', arrivee:'' })
  const [showLoginModal, setShowLoginModal] = useState(false)

  useEffect(() => { chargerDonnees() }, [])

  const chargerDonnees = async () => {
    setLoading(true)
    try {
      const t = await getTrajets()
      setTrajets(Array.isArray(t) ? t : [])
    } catch (e) {}
    finally { setLoading(false) }
  }

  const handleClickTrajet = (trajetId) => {
    if (!user) { setShowLoginModal(true); return }
    navigate(`/trajets/${trajetId}`)
  }

  const trajetsFiltres = trajets.filter(t => {
    const d = search.depart.toLowerCase()
    const a = search.arrivee.toLowerCase()
    return (!d || t.villeDepart?.toLowerCase().includes(d)) &&
           (!a || t.villeArrivee?.toLowerCase().includes(a))
  })

  const inputStyle = { padding:'0.75rem 1rem', border:'1px solid #D1D5DB', borderRadius:8, fontSize:'0.88rem', outline:'none', fontFamily:'system-ui,sans-serif', color:'#111827', background:'white' }

  return (
    <>
      <Header />
      <div style={{ marginTop:108, background:'#F9FAFB', minHeight:'100vh' }}>

        {/* Hero */}
        <div style={{ background:'#111827', padding:'2rem 3rem' }}>
          <div style={{ maxWidth:1280, margin:'0 auto' }}>
            <div style={{ marginBottom:'1.5rem' }}>
              <div style={{ display:'inline-flex', alignItems:'center', gap:'0.4rem', background:'rgba(255,255,255,0.12)', color:'white', padding:'0.25rem 0.8rem', borderRadius:50, fontSize:'0.75rem', fontWeight:500, fontFamily:'system-ui,sans-serif', marginBottom:8 }}>
                <span style={{ width:5, height:5, background:'#00875A', borderRadius:'50%' }} />
                Covoiturage
              </div>
              <h1 style={{ fontWeight:800, fontSize:'1.8rem', color:'white', fontFamily:'system-ui,sans-serif', margin:0 }}>
                Trajets disponibles
              </h1>
            </div>

            {/* Barre de recherche */}
            <div style={{ display:'flex', gap:'0.8rem', flexWrap:'wrap' }}>
              <input placeholder="Ville de départ" value={search.depart}
                onChange={e => setSearch({...search, depart: e.target.value})}
                style={{ ...inputStyle, flex:1, minWidth:180 }} />
              <input placeholder="Ville d'arrivée" value={search.arrivee}
                onChange={e => setSearch({...search, arrivee: e.target.value})}
                style={{ ...inputStyle, flex:1, minWidth:180 }} />
              <button onClick={chargerDonnees}
                style={{ padding:'0.75rem 1.8rem', background:'#00875A', color:'white', border:'none', borderRadius:8, fontWeight:600, fontSize:'0.88rem', cursor:'pointer', fontFamily:'system-ui,sans-serif' }}>
                Rechercher
              </button>
            </div>
          </div>
        </div>

        <div style={{ maxWidth:1280, margin:'0 auto', padding:'2rem 3rem' }}>
          <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
            <div style={{ fontWeight:600, fontSize:'0.9rem', color:'#374151', fontFamily:'system-ui,sans-serif' }}>
              {trajetsFiltres.length} trajet(s) disponible(s)
            </div>

            {loading ? (
              <div style={{ display:'flex', flexDirection:'column', gap:'0.8rem' }}>
                {[1,2,3].map(i => <div key={i} style={{ height:100, background:'white', borderRadius:12, border:'1px solid #E5E7EB', opacity:0.4 }} />)}
              </div>
            ) : trajetsFiltres.length === 0 ? (
              <div style={{ background:'white', borderRadius:12, padding:'3rem', textAlign:'center', border:'1px solid #E5E7EB' }}>
                <div style={{ fontSize:'2rem', marginBottom:'0.8rem' }}>🚗</div>
                <div style={{ fontWeight:600, color:'#374151', fontFamily:'system-ui,sans-serif' }}>Aucun trajet trouvé</div>
              </div>
            ) : trajetsFiltres.map(t => (
              <div key={t.id}
                style={{ background:'white', borderRadius:12, border:'1px solid #E5E7EB', padding:'1.2rem 1.5rem', cursor:'pointer', transition:'all 0.2s', boxShadow:'0 1px 3px rgba(0,0,0,0.04)' }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow='0 4px 16px rgba(0,135,90,0.1)'; e.currentTarget.style.borderColor='#A7F3D0' }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow='0 1px 3px rgba(0,0,0,0.04)'; e.currentTarget.style.borderColor='#E5E7EB' }}>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:'1rem' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:'1rem' }}>
                    <div style={{ width:48, height:48, borderRadius:'50%', overflow:'hidden', border:'2px solid #E8F5F0', flexShrink:0 }}>
                      {t.photoProfile ? (
                        <img src={`http://localhost:8080/api/documents/fichier/${t.photoProfile}`} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                      ) : (
                        <div style={{ width:'100%', height:'100%', background:'#00875A', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, fontSize:'1rem', color:'white', fontFamily:'system-ui,sans-serif' }}>
                          {t.nomConducteur?.split(' ').map(n=>n[0]).join('').slice(0,2) || 'C'}
                        </div>
                      )}
                    </div>
                    <div>
                      <div style={{ fontWeight:700, fontSize:'1rem', color:'#111827', fontFamily:'system-ui,sans-serif' }}>
                        {t.villeDepart} → {t.villeArrivee}
                      </div>
                      <div style={{ fontSize:'0.78rem', color:'#6B7280', marginTop:2, fontFamily:'system-ui,sans-serif' }}>
                        {new Date(t.dateHeure).toLocaleDateString('fr-FR')} à {new Date(t.dateHeure).toLocaleTimeString('fr-FR', {hour:'2-digit',minute:'2-digit'})}
                        {' · '}{t.placesDisponibles} place(s) · {t.nomConducteur}
                      </div>
                      {t.noteMoyenne > 0 && (
                        <div style={{ fontSize:'0.75rem', color:'#F59E0B', marginTop:2, fontFamily:'system-ui,sans-serif' }}>
                          {'★'.repeat(Math.round(t.noteMoyenne))} {t.noteMoyenne?.toFixed(1)}
                        </div>
                      )}
                    </div>
                  </div>
                  <div style={{ display:'flex', alignItems:'center', gap:'1rem' }}>
                    {t.photoVoiture && (
                      <img src={`http://localhost:8080/api/documents/fichier/${t.photoVoiture}`} alt=""
                        style={{ width:72, height:48, objectFit:'cover', borderRadius:8, border:'1px solid #E5E7EB' }} />
                    )}
                    <div style={{ textAlign:'right' }}>
                      <div style={{ fontWeight:800, fontSize:'1.3rem', color:'#00875A', fontFamily:'system-ui,sans-serif' }}>{t.prixParPlace} MAD</div>
                      <div style={{ fontSize:'0.73rem', color:'#9CA3AF', fontFamily:'system-ui,sans-serif', marginBottom:'0.4rem' }}>par place</div>
                      <button
                        onClick={() => handleClickTrajet(t.id)}
                        style={{ background:'#00875A', color:'white', border:'none', borderRadius:8, padding:'0.5rem 1.2rem', fontWeight:600, fontSize:'0.83rem', cursor:'pointer', fontFamily:'system-ui,sans-serif', transition:'all 0.2s' }}
                        onMouseEnter={e => { e.currentTarget.style.background='#005C3E'; e.currentTarget.style.transform='translateY(-1px)' }}
                        onMouseLeave={e => { e.currentTarget.style.background='#00875A'; e.currentTarget.style.transform='translateY(0)' }}>
                        {user ? 'Réserver' : '🔐 Se connecter'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modal connexion */}
      {showLoginModal && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.55)', zIndex:2000, display:'flex', alignItems:'center', justifyContent:'center', padding:'1rem' }}>
          <div style={{ background:'white', borderRadius:14, padding:'2rem', maxWidth:380, width:'100%', textAlign:'center', boxShadow:'0 24px 64px rgba(0,0,0,0.25)' }}>
            <div style={{ fontSize:'2.5rem', marginBottom:'0.8rem' }}>🔐</div>
            <div style={{ fontWeight:700, fontSize:'1.1rem', color:'#111827', marginBottom:'0.5rem', fontFamily:'system-ui,sans-serif' }}>Connexion requise</div>
            <div style={{ fontSize:'0.83rem', color:'#6B7280', marginBottom:'1.5rem', fontFamily:'system-ui,sans-serif', lineHeight:1.6 }}>
              Vous devez être connecté pour réserver un trajet.
            </div>
            <div style={{ display:'flex', gap:'0.8rem', justifyContent:'center' }}>
              <button onClick={() => { setShowLoginModal(false); navigate('/auth/login') }}
                style={{ background:'#00875A', color:'white', border:'none', borderRadius:8, padding:'0.7rem 1.5rem', fontWeight:600, cursor:'pointer', fontFamily:'system-ui,sans-serif', fontSize:'0.88rem' }}>
                Se connecter
              </button>
              <button onClick={() => { setShowLoginModal(false); navigate('/auth/register') }}
                style={{ background:'#111827', color:'white', border:'none', borderRadius:8, padding:'0.7rem 1.5rem', fontWeight:600, cursor:'pointer', fontFamily:'system-ui,sans-serif', fontSize:'0.88rem' }}>
                S'inscrire
              </button>
              <button onClick={() => setShowLoginModal(false)}
                style={{ background:'#F3F4F6', color:'#374151', border:'none', borderRadius:8, padding:'0.7rem 1.2rem', fontWeight:500, cursor:'pointer', fontFamily:'system-ui,sans-serif', fontSize:'0.88rem' }}>
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </>
  )
}