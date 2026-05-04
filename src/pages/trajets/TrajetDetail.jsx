import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import Header from '../../components/layout/Header'
import Footer from '../../components/layout/Footer'
import { getTrajetById, creerReservation, creerNegociation, isAuthenticated } from '../../lib/api'

export default function TrajetDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [trajet, setTrajet] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [offre, setOffre] = useState('')
  const [places, setPlaces] = useState(1)
  const [etape, setEtape] = useState('reservation')
  const [actionLoading, setActionLoading] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')

  useEffect(() => {
    chargerTrajet()
  }, [id])

  const chargerTrajet = async () => {
    setLoading(true)
    try {
      const data = await getTrajetById(id)
      setTrajet(data)
    } catch (e) {
      setError('Trajet introuvable')
    } finally {
      setLoading(false)
    }
  }

  const handleReservation = async () => {
    if (!isAuthenticated()) {
      navigate('/auth/login')
      return
    }
    setActionLoading(true)
    try {
      await creerReservation({ trajetId: parseInt(id), nbPlaces: places })
      setSuccessMsg('Réservation effectuée avec succès !')
      setEtape('confirmation')
    } catch (e) {
      setError('Erreur lors de la réservation')
    } finally {
      setActionLoading(false)
    }
  }

  const handleNegociation = async () => {
    if (!isAuthenticated()) {
      navigate('/auth/login')
      return
    }
    if (!offre) return
    setActionLoading(true)
    try {
      await creerNegociation({ trajetId: parseInt(id), offreClient: parseFloat(offre) })
      setEtape('confirmation')
      setSuccessMsg(`Offre de ${offre} MAD envoyée au conducteur !`)
    } catch (e) {
      setError('Erreur lors de la négociation')
    } finally {
      setActionLoading(false)
    }
  }

  if (loading) return (
    <>
      <Header />
      <div style={{ marginTop: 108, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⏳</div>
          <p style={{ color: 'var(--muted)' }}>Chargement du trajet...</p>
        </div>
      </div>
      <Footer />
    </>
  )

  if (error || !trajet) return (
    <>
      <Header />
      <div style={{ marginTop: 108, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>❌</div>
          <h3 style={{ fontFamily: 'Bricolage Grotesque,sans-serif', fontWeight: 800, marginBottom: '0.5rem' }}>Trajet introuvable</h3>
          <Link to="/trajets" style={{ color: 'var(--primary)', fontWeight: 600 }}>← Retour aux trajets</Link>
        </div>
      </div>
      <Footer />
    </>
  )

  return (
    <>
      <Header />
      <div style={{ marginTop: 108, background: 'var(--gray)', minHeight: '100vh', padding: '2.5rem 3rem' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>

          {/* Breadcrumb */}
          <div style={{ fontSize: '0.82rem', color: 'var(--muted)', marginBottom: '1.5rem' }}>
            <Link to="/" style={{ color: 'var(--muted)', textDecoration: 'none' }}>Accueil</Link> ›
            <Link to="/trajets" style={{ color: 'var(--muted)', textDecoration: 'none' }}> Trajets</Link> ›
            <span style={{ color: 'var(--dark)', fontWeight: 600 }}> {trajet.villeDepart} → {trajet.villeArrivee}</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '2rem', alignItems: 'start' }}>

            {/* Colonne gauche */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

              {/* Carte principale */}
              <div style={{ background: 'white', borderRadius: 20, border: '1px solid var(--border)', overflow: 'hidden' }}>
                <div style={{ background: 'linear-gradient(135deg,#005C3E,#00875A)', padding: '2rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                        <span style={{ fontFamily: 'Bricolage Grotesque,sans-serif', fontWeight: 800, fontSize: '1.8rem', color: 'white' }}>{trajet.villeDepart}</span>
                        <span style={{ color: 'var(--gold)', fontSize: '1.5rem' }}>→</span>
                        <span style={{ fontFamily: 'Bricolage Grotesque,sans-serif', fontWeight: 800, fontSize: '1.8rem', color: 'white' }}>{trajet.villeArrivee}</span>
                      </div>
                      <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.88rem' }}>
                        📅 {new Date(trajet.dateHeure).toLocaleDateString('fr-FR')} · ⏰ {new Date(trajet.dateHeure).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontFamily: 'Bricolage Grotesque,sans-serif', fontSize: '2.5rem', fontWeight: 800, color: 'white', lineHeight: 1 }}>{trajet.prixParPlace} MAD</div>
                      <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.82rem' }}>par place</div>
                    </div>
                  </div>
                </div>
                <div style={{ padding: '1.5rem', display: 'flex', gap: '1.5rem', flexWrap: 'wrap', borderBottom: '1px solid var(--border)' }}>
                  {[
                    ['💺', `${trajet.placesDisponibles} place(s) disponible(s)`],
                    trajet.volumeCoffre ? ['🧳', `Coffre ${trajet.volumeCoffre} kg`] : null,
                    trajet.statut ? ['📋', trajet.statut] : null
                  ].filter(Boolean).map(([ico, label]) => (
                    <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.88rem', color: 'var(--muted)' }}>
                      <span>{ico}</span><span>{label}</span>
                    </div>
                  ))}
                </div>
                {trajet.description && (
                  <div style={{ padding: '1.5rem' }}>
                    <p style={{ fontSize: '0.9rem', color: 'var(--muted)', lineHeight: 1.7 }}>{trajet.description}</p>
                  </div>
                )}
              </div>

              {/* Conducteur */}
              <div style={{ background: 'white', borderRadius: 16, border: '1px solid var(--border)', padding: '1.5rem' }}>
                <h3 style={{ fontFamily: 'Bricolage Grotesque,sans-serif', fontWeight: 700, fontSize: '1rem', marginBottom: '1.2rem' }}>Conducteur</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--dark)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Bricolage Grotesque,sans-serif', fontWeight: 800, fontSize: '1.2rem', color: 'white' }}>
                    {trajet.nomConducteur?.split(' ').map(n => n[0]).join('') || 'C'}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: 'Bricolage Grotesque,sans-serif', fontWeight: 700, fontSize: '1.05rem', color: 'var(--dark)' }}>{trajet.nomConducteur}</div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--muted)', marginTop: 2 }}>
                      ⭐ {trajet.noteConducteur?.toFixed(1) || 'N/A'}
                    </div>
                  </div>
                  {trajet.conducteurVerifie && (
                    <span style={{ background: 'var(--primary-light)', color: 'var(--primary)', padding: '0.25rem 0.75rem', borderRadius: 20, fontSize: '0.75rem', fontWeight: 700 }}>✓ Vérifié</span>
                  )}
                </div>
              </div>
            </div>

            {/* Colonne droite */}
            <div style={{ background: 'white', borderRadius: 20, border: '1px solid var(--border)', padding: '1.8rem', position: 'sticky', top: 130 }}>

              {etape === 'reservation' && (
                <>
                  <h3 style={{ fontFamily: 'Bricolage Grotesque,sans-serif', fontWeight: 800, fontSize: '1.1rem', marginBottom: '1.5rem' }}>Réserver ce trajet</h3>

                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '0.4rem' }}>Nombre de places</label>
                    <select value={places} onChange={e => setPlaces(parseInt(e.target.value))}
                      style={{ width: '100%', padding: '0.85rem 1rem', border: '1.5px solid var(--border)', borderRadius: 10, fontSize: '0.92rem', outline: 'none', fontFamily: 'inherit', background: 'var(--gray)' }}>
                      {Array.from({ length: Math.min(trajet.placesDisponibles, 4) }, (_, i) => i + 1).map(n => (
                        <option key={n} value={n}>{n} place{n > 1 ? 's' : ''}</option>
                      ))}
                    </select>
                  </div>

                  <div style={{ background: 'var(--gray)', borderRadius: 12, padding: '1.2rem', marginBottom: '1.2rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                      <span style={{ fontSize: '0.88rem', color: 'var(--muted)' }}>{places} place{places > 1 ? 's' : ''} × {trajet.prixParPlace} MAD</span>
                      <span style={{ fontWeight: 700 }}>{places * trajet.prixParPlace} MAD</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 8, borderTop: '1px dashed var(--border)' }}>
                      <span style={{ fontWeight: 700 }}>Total</span>
                      <span style={{ fontFamily: 'Bricolage Grotesque,sans-serif', fontSize: '1.3rem', fontWeight: 800, color: 'var(--primary)' }}>{places * trajet.prixParPlace} MAD</span>
                    </div>
                  </div>

                  <button onClick={handleReservation} disabled={actionLoading}
                    style={{ width: '100%', padding: '1rem', background: actionLoading ? 'var(--muted)' : 'var(--primary)', color: 'white', border: 'none', borderRadius: 10, fontSize: '1rem', fontWeight: 700, cursor: actionLoading ? 'not-allowed' : 'pointer', fontFamily: 'inherit', marginBottom: '0.8rem' }}>
                    {actionLoading ? 'Réservation...' : '✓ Confirmer la réservation'}
                  </button>

                  <button onClick={() => setEtape('negociation')}
                    style={{ width: '100%', padding: '0.9rem', background: 'var(--gray)', color: 'var(--dark)', border: '1.5px solid var(--border)', borderRadius: 10, fontSize: '0.92rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                    💬 Négocier le tarif
                  </button>
                </>
              )}

              {etape === 'negociation' && (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                    <button onClick={() => setEtape('reservation')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.1rem', color: 'var(--muted)' }}>←</button>
                    <h3 style={{ fontFamily: 'Bricolage Grotesque,sans-serif', fontWeight: 800, fontSize: '1.1rem' }}>Négocier le tarif</h3>
                  </div>

                  <div style={{ background: 'var(--gray)', borderRadius: 12, padding: '1.2rem', marginBottom: '1.2rem', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.78rem', color: 'var(--muted)', fontWeight: 700, textTransform: 'uppercase', marginBottom: 4 }}>Prix affiché</div>
                    <div style={{ fontFamily: 'Bricolage Grotesque,sans-serif', fontSize: '2rem', fontWeight: 800, color: 'var(--dark)' }}>{trajet.prixParPlace} MAD</div>
                  </div>

                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '0.4rem' }}>Votre offre (MAD)</label>
                    <input type="number" placeholder={`Ex: ${trajet.prixParPlace - 10}`} value={offre}
                      onChange={e => setOffre(e.target.value)}
                      style={{ width: '100%', padding: '0.85rem 1rem', border: '1.5px solid var(--border)', borderRadius: 10, fontSize: '1rem', outline: 'none', fontFamily: 'inherit' }} />
                  </div>

                  <div style={{ background: '#FFF8E6', borderRadius: 10, padding: '0.8rem 1rem', marginBottom: '1.2rem', fontSize: '0.82rem', color: '#92610A' }}>
                    💡 Le conducteur peut accepter, refuser ou faire une contre-offre.
                  </div>

                  <button onClick={handleNegociation} disabled={actionLoading || !offre}
                    style={{ width: '100%', padding: '1rem', background: actionLoading || !offre ? 'var(--muted)' : 'var(--primary)', color: 'white', border: 'none', borderRadius: 10, fontSize: '1rem', fontWeight: 700, cursor: actionLoading || !offre ? 'not-allowed' : 'pointer', fontFamily: 'inherit', marginBottom: '0.8rem' }}>
                    {actionLoading ? 'Envoi...' : 'Envoyer mon offre'}
                  </button>

                  <button onClick={() => setEtape('reservation')}
                    style={{ width: '100%', padding: '0.85rem', background: 'transparent', color: 'var(--muted)', border: '1.5px solid var(--border)', borderRadius: 10, fontSize: '0.9rem', cursor: 'pointer', fontFamily: 'inherit' }}>
                    Annuler
                  </button>
                </>
              )}

              {etape === 'confirmation' && (
                <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                  <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', margin: '0 auto 1.2rem' }}>✅</div>
                  <h3 style={{ fontFamily: 'Bricolage Grotesque,sans-serif', fontWeight: 800, fontSize: '1.2rem', color: 'var(--dark)', marginBottom: '0.6rem' }}>
                    {successMsg}
                  </h3>
                  <p style={{ color: 'var(--muted)', fontSize: '0.88rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
                    Vous pouvez suivre l'état dans votre dashboard.
                  </p>
                  <Link to="/dashboard/client">
                    <button style={{ width: '100%', padding: '0.9rem', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: 10, fontSize: '0.95rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                      Voir mon dashboard
                    </button>
                  </Link>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}