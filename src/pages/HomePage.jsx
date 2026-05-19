import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Header from '../components/layout/Header'
import Hero from '../components/home/Hero'
import StatsBar from '../components/home/StatsBar'
import HowItWorks from '../components/home/HowItWorks'
import Services from '../components/home/Services'
import Testimonials from '../components/home/Testimonials'
import Footer from '../components/layout/Footer'
import { getTrajets } from '../lib/api'

export default function HomePage() {
  const [trajets, setTrajets] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getTrajets()
      .then(data => setTrajets(Array.isArray(data) ? data.slice(0, 6) : []))
      .catch(() => setTrajets([]))
      .finally(() => setLoading(false))
  }, [])

  const formatDate = (dateHeure) => {
    const d = new Date(dateHeure)
    return d.toLocaleDateString('fr-FR', { weekday:'long', day:'numeric', month:'long' })
  }

  const formatTime = (dateHeure) => {
    return new Date(dateHeure).toLocaleTimeString('fr-FR', { hour:'2-digit', minute:'2-digit' })
  }

  return (
    <>
      <Header />
      <Hero />
      <StatsBar />
      <HowItWorks />

      {/* Section Trajets réels */}
      <div style={{ background:'white', padding:'5rem 3rem' }}>
        <div style={{ maxWidth:1400, margin:'0 auto' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end', marginBottom:'2.5rem' }}>
            <div>
              <div style={{ display:'inline-flex', alignItems:'center', gap:'0.5rem', background:'var(--primary-light)', color:'var(--primary)', padding:'0.35rem 1rem', borderRadius:50, fontSize:'0.78rem', fontWeight:700, marginBottom:'1rem' }}>
                <span style={{ width:5, height:5, background:'var(--primary)', borderRadius:'50%' }} /> Trajets disponibles
              </div>
              <h2 style={{ fontFamily:'Bricolage Grotesque,sans-serif', fontSize:'2.6rem', fontWeight:800, color:'var(--dark)' }}>
                Partez <span style={{ color:'var(--primary)' }}>aujourd'hui</span>
              </h2>
            </div>
            <Link to="/trajets" style={{ color:'var(--primary)', fontWeight:600, textDecoration:'none', fontFamily:'system-ui,sans-serif' }}>
              Voir tous les trajets →
            </Link>
          </div>

          {loading ? (
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:'1rem' }}>
              {[1,2,3].map(i => (
                <div key={i} style={{ background:'#F9FAFB', borderRadius:10, height:180, border:'1px solid #E5E7EB', opacity:0.5 }} />
              ))}
            </div>
          ) : trajets.length === 0 ? (
            <div style={{ textAlign:'center', padding:'3rem', color:'#6B7280', fontFamily:'system-ui,sans-serif' }}>
              <div style={{ fontSize:'2.5rem', marginBottom:'1rem' }}>🚗</div>
              <div style={{ fontWeight:500 }}>Aucun trajet disponible pour le moment.</div>
              <div style={{ fontSize:'0.85rem', marginTop:'0.5rem' }}>Revenez plus tard ou inscrivez-vous comme conducteur !</div>
            </div>
          ) : (
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:'1.2rem' }}>
              {trajets.map(t => (
                <Link key={t.id} to={`/trajets/${t.id}`} style={{ textDecoration:'none' }}>
                  <div style={{ background:'white', borderRadius:10, border:'1px solid #E5E7EB', overflow:'hidden', transition:'box-shadow 0.2s, transform 0.2s', cursor:'pointer' }}
                    onMouseEnter={e => { e.currentTarget.style.boxShadow='0 4px 20px rgba(0,0,0,0.1)'; e.currentTarget.style.transform='translateY(-2px)' }}
                    onMouseLeave={e => { e.currentTarget.style.boxShadow='none'; e.currentTarget.style.transform='translateY(0)' }}>

                    {/* Photo voiture */}
                    <div style={{ position:'relative', height:140, overflow:'hidden' }}>
                      <img
                        src={t.photoVoiture
                          ? `http://localhost:8080/api/documents/fichier/${t.photoVoiture}`
                          : 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=500&q=80&fit=crop'}
                        alt="Voiture"
                        style={{ width:'100%', height:'100%', objectFit:'cover' }}
                        onError={e => e.target.src='https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=500&q=80&fit=crop'}
                      />
                      {/* Prix en overlay */}
                      <div style={{ position:'absolute', top:10, right:10, background:'white', borderRadius:6, padding:'0.3rem 0.7rem', fontWeight:700, fontSize:'0.9rem', color:'#111827', fontFamily:'system-ui,sans-serif', boxShadow:'0 2px 8px rgba(0,0,0,0.15)' }}>
                        {t.prixParPlace} MAD
                      </div>
                      {/* Marque */}
                      {t.marqueVoiture && (
                        <div style={{ position:'absolute', bottom:8, left:8, background:'rgba(0,0,0,0.6)', color:'white', borderRadius:4, padding:'0.15rem 0.5rem', fontSize:'0.7rem', fontWeight:600, fontFamily:'system-ui,sans-serif' }}>
                          {t.marqueVoiture}
                        </div>
                      )}
                    </div>

                    {/* Contenu */}
                    <div style={{ padding:'1rem' }}>
                      {/* Trajet */}
                      <div style={{ fontWeight:700, fontSize:'1rem', color:'#111827', fontFamily:'system-ui,sans-serif', marginBottom:'0.3rem' }}>
                        {t.villeDepart} → {t.villeArrivee}
                      </div>

                      {/* Date */}
                      <div style={{ fontSize:'0.78rem', color:'#6B7280', fontFamily:'system-ui,sans-serif', marginBottom:'0.8rem' }}>
                        {formatDate(t.dateHeure)} à {formatTime(t.dateHeure)}
                      </div>

                      {/* Conducteur + places */}
                      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                        <div style={{ display:'flex', alignItems:'center', gap:'0.5rem' }}>
                          {/* Photo conducteur */}
                          <div style={{ width:32, height:32, borderRadius:'50%', overflow:'hidden', flexShrink:0, border:'1.5px solid #E5E7EB' }}>
                            {t.photoProfile ? (
                              <img src={`http://localhost:8080/api/documents/fichier/${t.photoProfile}`}
                                alt={t.nomConducteur}
                                style={{ width:'100%', height:'100%', objectFit:'cover' }}
                                onError={e => { e.target.style.display='none' }}
                              />
                            ) : (
                              <div style={{ width:'100%', height:'100%', background:'#111827', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, fontSize:'0.7rem', color:'white', fontFamily:'system-ui,sans-serif' }}>
                                {t.nomConducteur?.split(' ').map(n=>n[0]).join('').toUpperCase().slice(0,2) || 'C'}
                              </div>
                            )}
                          </div>
                          <div>
                            <div style={{ fontWeight:600, fontSize:'0.8rem', color:'#111827', fontFamily:'system-ui,sans-serif' }}>{t.nomConducteur}</div>
                            <div style={{ fontSize:'0.7rem', color:'#F59E0B', fontFamily:'system-ui,sans-serif' }}>
                              ★ {t.noteConducteur > 0 ? parseFloat(t.noteConducteur).toFixed(1) : 'Nouveau'}
                            </div>
                          </div>
                        </div>

                        {/* Places */}
                        <div style={{ background:'#F3F4F6', borderRadius:4, padding:'0.2rem 0.6rem', fontSize:'0.73rem', color:'#374151', fontFamily:'system-ui,sans-serif', fontWeight:500 }}>
                          {t.placesDisponibles} place{t.placesDisponibles > 1 ? 's' : ''}
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
      <button onClick={() => navigate('/trajets?tab=livraison')}
  style={{ background:'#C2410C', color:'white', border:'none', borderRadius:8, padding:'0.65rem 1.4rem', fontWeight:600, fontSize:'0.88rem', cursor:'pointer', fontFamily:'system-ui,sans-serif' }}>
  📦 Voir les offres livraison
</button>

      <Services />
      <Testimonials />
      <Footer />
    </>
  )
}