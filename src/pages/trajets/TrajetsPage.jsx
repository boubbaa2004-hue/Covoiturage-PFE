import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import Header from '../../components/layout/Header'
import Footer from '../../components/layout/Footer'
import TrajetCard from '../../components/home/TrajetCard'
import { getTrajets, rechercherTrajets, isAuthenticated } from '../../lib/api'

export default function TrajetsPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const departParam = searchParams.get('depart') || ''
  const arriveeParam = searchParams.get('arrivee') || ''

  const [trajets, setTrajets] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState({ villeDepart: departParam, villeArrivee: arriveeParam })
  const [searched, setSearched] = useState(!!(departParam && arriveeParam))
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [selectedTrajetId, setSelectedTrajetId] = useState(null)

  useEffect(() => {
    if (departParam && arriveeParam) {
      doRecherche(departParam, arriveeParam)
    } else {
      chargerTrajets()
    }
  }, [])

  const chargerTrajets = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await getTrajets()
      setTrajets(Array.isArray(data) ? data : [])
    } catch (e) {
      setError('Impossible de charger les trajets')
    } finally {
      setLoading(false)
    }
  }

  const doRecherche = async (dep, arr) => {
    setLoading(true)
    setError('')
    setSearched(true)
    try {
      const data = await rechercherTrajets(dep, arr)
      setTrajets(Array.isArray(data) ? data : [])
    } catch (e) {
      setTrajets([])
    } finally {
      setLoading(false)
    }
  }

  const handleRecherche = () => {
    if (!search.villeDepart || !search.villeArrivee) return
    doRecherche(search.villeDepart, search.villeArrivee)
  }

  const handleReset = () => {
    setSearch({ villeDepart: '', villeArrivee: '' })
    setSearched(false)
    chargerTrajets()
  }

  const handleTrajetClick = (trajetId) => {
    if (isAuthenticated()) {
      navigate(`/trajets/${trajetId}`)
    } else {
      setSelectedTrajetId(trajetId)
      setShowLoginModal(true)
    }
  }

  const mapTrajet = (t) => ({
    type: 'covoiturage',
    from: t.villeDepart,
    to: t.villeArrivee,
    date: `📅 ${new Date(t.dateHeure).toLocaleDateString('fr-FR')}`,
    seats: `💺 ${t.placesDisponibles} place(s)`,
    duration: `⏰ ${new Date(t.dateHeure).toLocaleTimeString('fr-FR', {hour:'2-digit', minute:'2-digit'})}`,
    driver: {
      name: t.nomConducteur,
      initials: t.nomConducteur?.split(' ').map(n => n[0]).join('') || 'C'
    },
    price: `${t.prixParPlace} MAD`,
    rating: t.noteConducteur?.toFixed(1) || '5.0',
    image: 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=500&q=80&fit=crop',
    id: t.id
  })

  return (
    <>
      <Header />

      {/* Modal connexion requise */}
      {showLoginModal && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.55)', zIndex:2000, display:'flex', alignItems:'center', justifyContent:'center', padding:'1rem' }}>
          <div style={{ background:'white', borderRadius:20, padding:'2.5rem', maxWidth:400, width:'100%', textAlign:'center', boxShadow:'0 24px 64px rgba(0,0,0,0.3)' }}>
            <div style={{ width:72, height:72, borderRadius:'50%', background:'var(--primary-light)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'2rem', margin:'0 auto 1.2rem' }}>
              🔐
            </div>
            <h3 style={{ fontFamily:'Bricolage Grotesque,sans-serif', fontWeight:800, fontSize:'1.3rem', color:'var(--dark)', marginBottom:'0.8rem' }}>
              Connexion requise
            </h3>
            <p style={{ color:'var(--muted)', fontSize:'0.92rem', lineHeight:1.6, marginBottom:'1.8rem' }}>
              Pour réserver ce trajet, vous devez être connecté à votre compte CovoLiv.
            </p>
            <div style={{ display:'flex', flexDirection:'column', gap:'0.8rem' }}>
              <button
                onClick={() => {
                  setShowLoginModal(false)
                  navigate(`/auth/login?redirect=/trajets/${selectedTrajetId}`)
                }}
                style={{ width:'100%', padding:'1rem', background:'var(--primary)', color:'white', border:'none', borderRadius:10, fontSize:'1rem', fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}>
                🔑 Se connecter
              </button>
              <button
                onClick={() => {
                  setShowLoginModal(false)
                  navigate('/auth/register')
                }}
                style={{ width:'100%', padding:'0.9rem', background:'var(--primary-light)', color:'var(--primary)', border:'none', borderRadius:10, fontSize:'0.95rem', fontWeight:600, cursor:'pointer', fontFamily:'inherit' }}>
                ✨ Créer un compte
              </button>
              <button
                onClick={() => setShowLoginModal(false)}
                style={{ width:'100%', padding:'0.8rem', background:'transparent', color:'var(--muted)', border:'1.5px solid var(--border)', borderRadius:10, fontSize:'0.9rem', cursor:'pointer', fontFamily:'inherit' }}>
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      <div style={{ marginTop:108, background:'var(--gray)', minHeight:'100vh' }}>

        {/* Barre de recherche */}
        <div style={{ background:'white', borderBottom:'1px solid var(--border)', padding:'1.5rem 3rem', boxShadow:'0 2px 12px rgba(0,0,0,0.04)' }}>
          <div style={{ maxWidth:1280, margin:'0 auto', display:'flex', gap:'1rem', flexWrap:'wrap', alignItems:'flex-end' }}>
            <div style={{ flex:1, minWidth:180 }}>
              <label style={{ fontSize:'0.75rem', fontWeight:700, color:'var(--muted)', textTransform:'uppercase', letterSpacing:'0.5px', display:'block', marginBottom:'0.4rem' }}>Départ</label>
              <div style={{ position:'relative' }}>
                <span style={{ position:'absolute', left:'0.9rem', top:'50%', transform:'translateY(-50%)' }}>📍</span>
                <input type="text" placeholder="Ex: Béni Mellal"
                  value={search.villeDepart}
                  onChange={e => setSearch({...search, villeDepart: e.target.value})}
                  onKeyDown={e => e.key === 'Enter' && handleRecherche()}
                  style={{ width:'100%', padding:'0.8rem 1rem 0.8rem 2.8rem', border:'1.5px solid var(--border)', borderRadius:10, fontSize:'0.92rem', outline:'none', fontFamily:'inherit' }}
                  onFocus={e => e.target.style.borderColor='var(--primary)'}
                  onBlur={e => e.target.style.borderColor='var(--border)'}
                />
              </div>
            </div>
            <div style={{ flex:1, minWidth:180 }}>
              <label style={{ fontSize:'0.75rem', fontWeight:700, color:'var(--muted)', textTransform:'uppercase', letterSpacing:'0.5px', display:'block', marginBottom:'0.4rem' }}>Destination</label>
              <div style={{ position:'relative' }}>
                <span style={{ position:'absolute', left:'0.9rem', top:'50%', transform:'translateY(-50%)' }}>🎯</span>
                <input type="text" placeholder="Ex: Casablanca"
                  value={search.villeArrivee}
                  onChange={e => setSearch({...search, villeArrivee: e.target.value})}
                  onKeyDown={e => e.key === 'Enter' && handleRecherche()}
                  style={{ width:'100%', padding:'0.8rem 1rem 0.8rem 2.8rem', border:'1.5px solid var(--border)', borderRadius:10, fontSize:'0.92rem', outline:'none', fontFamily:'inherit' }}
                  onFocus={e => e.target.style.borderColor='var(--primary)'}
                  onBlur={e => e.target.style.borderColor='var(--border)'}
                />
              </div>
            </div>
            <button onClick={handleRecherche}
              style={{ padding:'0.8rem 2rem', background:'var(--primary)', color:'white', border:'none', borderRadius:10, fontWeight:700, fontSize:'0.95rem', cursor:'pointer', fontFamily:'inherit' }}>
              🔍 Rechercher
            </button>
            {searched && (
              <button onClick={handleReset}
                style={{ padding:'0.8rem 1.5rem', background:'var(--gray)', color:'var(--muted)', border:'1.5px solid var(--border)', borderRadius:10, fontWeight:600, fontSize:'0.92rem', cursor:'pointer', fontFamily:'inherit' }}>
                ✕ Réinitialiser
              </button>
            )}
          </div>
        </div>

        {/* Contenu */}
        <div style={{ maxWidth:1280, margin:'0 auto', padding:'2.5rem 3rem' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.5rem', flexWrap:'wrap', gap:'1rem' }}>
            <div>
              <h1 style={{ fontFamily:'Bricolage Grotesque,sans-serif', fontSize:'2rem', fontWeight:800, color:'var(--dark)', marginBottom:4 }}>
                {searched ? `${search.villeDepart} → ${search.villeArrivee}` : 'Tous les trajets'}
              </h1>
              <p style={{ color:'var(--muted)', fontSize:'0.88rem' }}>
                {loading ? 'Recherche en cours...' : `${trajets.length} trajet(s) disponible(s)`}
              </p>
            </div>
          </div>

          {error && (
            <div style={{ background:'#FDEDED', color:'#C62828', padding:'1rem', borderRadius:10, marginBottom:'1.5rem', fontWeight:600 }}>❌ {error}</div>
          )}

          {loading && (
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(290px,1fr))', gap:'1.5rem' }}>
              {[1,2,3].map(i => (
                <div key={i} style={{ background:'white', borderRadius:16, height:280, border:'1px solid var(--border)', opacity:0.5 }} />
              ))}
            </div>
          )}

          {/* Trajets trouvés — cliquables */}
          {!loading && trajets.length > 0 && (
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(290px,1fr))', gap:'1.5rem' }}>
              {trajets.map(t => (
                <div key={t.id} onClick={() => handleTrajetClick(t.id)} style={{ cursor:'pointer' }}>
                  <TrajetCard {...mapTrajet(t)} />
                </div>
              ))}
            </div>
          )}

          {/* Aucun trajet */}
          {!loading && trajets.length === 0 && (
            <div style={{ textAlign:'center', padding:'5rem 2rem', background:'white', borderRadius:20, border:'1px solid var(--border)' }}>
              {searched ? (
                <>
                  <div style={{ fontSize:'4rem', marginBottom:'1rem' }}>🔍</div>
                  <h3 style={{ fontFamily:'Bricolage Grotesque,sans-serif', fontWeight:800, fontSize:'1.4rem', color:'var(--dark)', marginBottom:'0.8rem' }}>
                    Trajet introuvable
                  </h3>
                  <p style={{ color:'var(--muted)', fontSize:'0.95rem', lineHeight:1.7, marginBottom:'0.5rem' }}>
                    Aucun trajet <strong>{search.villeDepart} → {search.villeArrivee}</strong> n'est disponible pour le moment.
                  </p>
                  <p style={{ color:'var(--muted)', fontSize:'0.88rem', marginBottom:'2rem' }}>
                    Essayez une autre date ou d'autres villes, ou revenez plus tard.
                  </p>
                  <button onClick={handleReset}
                    style={{ padding:'0.9rem 2rem', background:'var(--primary)', color:'white', border:'none', borderRadius:10, fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}>
                    Voir tous les trajets
                  </button>
                </>
              ) : (
                <>
                  <div style={{ fontSize:'4rem', marginBottom:'1rem' }}>🚗</div>
                  <h3 style={{ fontFamily:'Bricolage Grotesque,sans-serif', fontWeight:800, fontSize:'1.4rem', color:'var(--dark)', marginBottom:'0.8rem' }}>
                    Aucun trajet disponible
                  </h3>
                  <p style={{ color:'var(--muted)', fontSize:'0.95rem', marginBottom:'2rem' }}>
                    Aucun conducteur n'a publié de trajet pour le moment.
                  </p>
                </>
              )}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  )
}