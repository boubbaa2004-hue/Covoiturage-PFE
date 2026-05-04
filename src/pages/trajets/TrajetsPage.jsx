import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Header from '../../components/layout/Header'
import Footer from '../../components/layout/Footer'
import TrajetCard from '../../components/home/TrajetCard'
import { getTrajets, rechercherTrajets } from '../../lib/api'

export default function TrajetsPage() {
  const [trajets, setTrajets] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState({ villeDepart: '', villeArrivee: '' })
  const [searched, setSearched] = useState(false)

  useEffect(() => {
    chargerTrajets()
  }, [])

  const chargerTrajets = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await getTrajets()
      setTrajets(data)
    } catch (e) {
      setError('Impossible de charger les trajets')
    } finally {
      setLoading(false)
    }
  }

  const handleRecherche = async () => {
    if (!search.villeDepart || !search.villeArrivee) return
    setLoading(true)
    setError('')
    setSearched(true)
    try {
      const data = await rechercherTrajets(search.villeDepart, search.villeArrivee)
      setTrajets(data)
    } catch (e) {
      setError('Erreur lors de la recherche')
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setSearch({ villeDepart: '', villeArrivee: '' })
    setSearched(false)
    chargerTrajets()
  }

  const mapTrajet = (t) => ({
    type: 'covoiturage',
    from: t.villeDepart,
    to: t.villeArrivee,
    date: `📅 ${new Date(t.dateHeure).toLocaleDateString('fr-FR')}`,
    seats: `💺 ${t.placesDisponibles} place(s)`,
    duration: t.volumeCoffre ? `🧳 ${t.volumeCoffre}kg coffre` : '⏱ En route',
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
      <div style={{ marginTop: 108, background: 'var(--gray)', minHeight: '100vh' }}>

        {/* Barre de recherche */}
        <div style={{ background: 'white', borderBottom: '1px solid var(--border)', padding: '1.5rem 3rem' }}>
          <div style={{ maxWidth: 1280, margin: '0 auto', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
            <div style={{ flex: 1, minWidth: 180 }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '0.4rem' }}>Départ</label>
              <input
                type="text"
                placeholder="Ex: Béni Mellal"
                value={search.villeDepart}
                onChange={e => setSearch({ ...search, villeDepart: e.target.value })}
                style={{ width: '100%', padding: '0.8rem 1rem', border: '1.5px solid var(--border)', borderRadius: 10, fontSize: '0.92rem', outline: 'none', fontFamily: 'inherit' }}
              />
            </div>
            <div style={{ flex: 1, minWidth: 180 }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '0.4rem' }}>Destination</label>
              <input
                type="text"
                placeholder="Ex: Casablanca"
                value={search.villeArrivee}
                onChange={e => setSearch({ ...search, villeArrivee: e.target.value })}
                style={{ width: '100%', padding: '0.8rem 1rem', border: '1.5px solid var(--border)', borderRadius: 10, fontSize: '0.92rem', outline: 'none', fontFamily: 'inherit' }}
              />
            </div>
            <button
              onClick={handleRecherche}
              style={{ padding: '0.8rem 2rem', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: 10, fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer', fontFamily: 'inherit' }}>
              🔍 Rechercher
            </button>
            {searched && (
              <button
                onClick={handleReset}
                style={{ padding: '0.8rem 1.5rem', background: 'var(--gray)', color: 'var(--muted)', border: '1.5px solid var(--border)', borderRadius: 10, fontWeight: 600, fontSize: '0.92rem', cursor: 'pointer', fontFamily: 'inherit' }}>
                ✕ Réinitialiser
              </button>
            )}
          </div>
        </div>

        {/* Contenu */}
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '2.5rem 3rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h1 style={{ fontFamily: 'Bricolage Grotesque,sans-serif', fontSize: '2rem', fontWeight: 800, color: 'var(--dark)', marginBottom: 4 }}>
                {searched ? `Résultats : ${search.villeDepart} → ${search.villeArrivee}` : 'Tous les trajets'}
              </h1>
              <p style={{ color: 'var(--muted)', fontSize: '0.88rem' }}>
                {loading ? 'Chargement...' : `${trajets.length} trajet(s) disponible(s)`}
              </p>
            </div>
          </div>

          {/* Erreur */}
          {error && (
            <div style={{ background: '#FDEDED', color: '#C62828', padding: '1rem', borderRadius: 10, marginBottom: '1.5rem', fontWeight: 600 }}>
              ❌ {error}
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(290px,1fr))', gap: '1.5rem' }}>
              {[1, 2, 3].map(i => (
                <div key={i} style={{ background: 'white', borderRadius: 16, height: 280, border: '1px solid var(--border)', animation: 'pulse 1.5s infinite' }} />
              ))}
            </div>
          )}

          {/* Trajets */}
          {!loading && trajets.length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(290px,1fr))', gap: '1.5rem' }}>
              {trajets.map(t => (
                <Link key={t.id} to={`/trajets/${t.id}`} style={{ textDecoration: 'none' }}>
                  <TrajetCard {...mapTrajet(t)} />
                </Link>
              ))}
            </div>
          )}

          {/* Aucun résultat */}
          {!loading && trajets.length === 0 && (
            <div style={{ textAlign: 'center', padding: '4rem', background: 'white', borderRadius: 16, border: '1px solid var(--border)' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🚗</div>
              <h3 style={{ fontFamily: 'Bricolage Grotesque,sans-serif', fontWeight: 800, fontSize: '1.2rem', color: 'var(--dark)', marginBottom: '0.5rem' }}>
                Aucun trajet trouvé
              </h3>
              <p style={{ color: 'var(--muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                {searched ? 'Essayez d\'autres villes ou dates.' : 'Aucun trajet disponible pour le moment.'}
              </p>
              {searched && (
                <button onClick={handleReset} style={{ background: 'var(--primary)', color: 'white', border: 'none', borderRadius: 10, padding: '0.8rem 2rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                  Voir tous les trajets
                </button>
              )}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  )
}