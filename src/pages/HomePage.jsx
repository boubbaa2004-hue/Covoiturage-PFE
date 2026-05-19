import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Header from '../components/layout/Header'
import Hero from '../components/home/Hero'
import StatsBar from '../components/home/StatsBar'
import HowItWorks from '../components/home/HowItWorks'
import Services from '../components/home/Services'
import Testimonials from '../components/home/Testimonials'
import Footer from '../components/layout/Footer'
import { getTrajets } from '../lib/api'

export default function HomePage() {
  const navigate = useNavigate()
  const [trajets, setTrajets] = useState([])
  const [offres, setOffres] = useState([])
  const [loading, setLoading] = useState(true)
  const [offresLoading, setOffresLoading] = useState(true)

  useEffect(() => {
    //  Trajets des 2 prochains jours uniquement
    getTrajets()
      .then(data => {
        if (!Array.isArray(data)) { setTrajets([]); return }
        const now = new Date()
        const dans2Jours = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000)
        const filtres = data.filter(t => {
          const d = new Date(t.dateHeure)
          return d >= now && d <= dans2Jours
        })
        setTrajets(filtres.slice(0, 6))
      })
      .catch(() => setTrajets([]))
      .finally(() => setLoading(false))

    // Offres livraison réelles
    fetch('http://localhost:8080/api/offres-livraison/disponibles')
      .then(r => r.ok ? r.json() : [])
      .then(data => setOffres(Array.isArray(data) ? data.slice(0, 3) : []))
      .catch(() => setOffres([]))
      .finally(() => setOffresLoading(false))
  }, [])

  const formatDate = (dateHeure) => {
    const d = new Date(dateHeure)
    const aujourd = new Date()
    const demain = new Date(aujourd.getTime() + 24 * 60 * 60 * 1000)
    if (d.toDateString() === aujourd.toDateString()) return "Aujourd'hui"
    if (d.toDateString() === demain.toDateString()) return 'Demain'
    return d.toLocaleDateString('fr-FR', { weekday:'long', day:'numeric', month:'long' })
  }

  const formatTime = (dateHeure) =>
    new Date(dateHeure).toLocaleTimeString('fr-FR', { hour:'2-digit', minute:'2-digit' })

  return (
    <>
      <Header />
      <Hero />
      <StatsBar />
      <HowItWorks />

      {/*  Section Trajets du jour */}
      <div style={{ background:'white', padding:'5rem 2rem' }}>
        <div style={{ maxWidth:1280, margin:'0 auto' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end', marginBottom:'2.5rem', flexWrap:'wrap', gap:'1rem' }}>
            <div>
              <div style={{ display:'inline-flex', alignItems:'center', gap:'0.5rem', background:'var(--primary-light)', color:'var(--primary)', padding:'0.35rem 1rem', borderRadius:50, fontSize:'0.78rem', fontWeight:700, marginBottom:'1rem' }}>
                <span style={{ width:5, height:5, background:'var(--primary)', borderRadius:'50%' }} /> Partez bientôt
              </div>
              <h2 style={{ fontFamily:'Bricolage Grotesque,sans-serif', fontSize:'clamp(1.8rem, 4vw, 2.6rem)', fontWeight:800, color:'var(--dark)', margin:0 }}>
                Trajets disponibles <span style={{ color:'var(--primary)' }}>aujourd'hui et demain</span>
              </h2>
              <p style={{ color:'var(--muted)', fontSize:'0.9rem', marginTop:'0.5rem', fontFamily:'system-ui,sans-serif' }}>
                Réservez maintenant, partez sereinement
              </p>
            </div>
            <Link to="/trajets"
              style={{ color:'var(--primary)', fontWeight:600, textDecoration:'none', fontFamily:'system-ui,sans-serif', whiteSpace:'nowrap', flexShrink:0 }}>
              Voir tous les trajets →
            </Link>
          </div>

          {loading ? (
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:'1rem' }}>
              {[1,2,3].map(i => (
                <div key={i} style={{ background:'#F9FAFB', borderRadius:12, height:200, border:'1px solid #E5E7EB', opacity:0.5 }} />
              ))}
            </div>
          ) : trajets.length === 0 ? (
            <div style={{ textAlign:'center', padding:'3rem', color:'#6B7280', fontFamily:'system-ui,sans-serif', background:'#F9FAFB', borderRadius:16, border:'1px solid #E5E7EB' }}>
              <div style={{ fontSize:'2.5rem', marginBottom:'1rem' }}>🚗</div>
              <div style={{ fontWeight:600, fontSize:'1rem', color:'#374151' }}>Aucun trajet disponible aujourd'hui ou demain</div>
              <div style={{ fontSize:'0.85rem', marginTop:'0.5rem' }}>Consultez tous les trajets disponibles</div>
              <Link to="/trajets"
                style={{ display:'inline-block', marginTop:'1rem', background:'var(--primary)', color:'white', padding:'0.6rem 1.4rem', borderRadius:8, textDecoration:'none', fontWeight:600, fontSize:'0.88rem' }}>
                Voir tous les trajets
              </Link>
            </div>
          ) : (
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:'1.2rem' }}>
              {trajets.map(t => (
                <Link key={t.id} to={`/trajets/${t.id}`} style={{ textDecoration:'none' }}>
                  <div
                    style={{ background:'white', borderRadius:12, border:'1px solid #E5E7EB', overflow:'hidden', transition:'box-shadow 0.2s, transform 0.2s', cursor:'pointer', height:'100%' }}
                    onMouseEnter={e => { e.currentTarget.style.boxShadow='0 8px 24px rgba(0,135,90,0.12)'; e.currentTarget.style.transform='translateY(-3px)' }}
                    onMouseLeave={e => { e.currentTarget.style.boxShadow='none'; e.currentTarget.style.transform='translateY(0)' }}>

                    {/* Photo voiture */}
                    <div style={{ position:'relative', height:140, overflow:'hidden', background:'#F3F4F6' }}>
                      <img
                        src={t.photoVoiture
                          ? `http://localhost:8080/api/documents/fichier/${t.photoVoiture}`
                          : 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=500&q=80&fit=crop'}
                        alt="Voiture"
                        style={{ width:'100%', height:'100%', objectFit:'cover' }}
                        onError={e => e.target.src='https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=500&q=80&fit=crop'}
                      />
                      {/* Prix */}
                      <div style={{ position:'absolute', top:10, right:10, background:'white', borderRadius:8, padding:'0.3rem 0.7rem', fontWeight:700, fontSize:'0.9rem', color:'#111827', fontFamily:'system-ui,sans-serif', boxShadow:'0 2px 8px rgba(0,0,0,0.15)' }}>
                        {t.prixParPlace} MAD
                      </div>
                      {/* Badge date */}
                      <div style={{ position:'absolute', top:10, left:10, background: formatDate(t.dateHeure) === "Aujourd'hui" ? '#00875A' : '#1E3A8A', color:'white', borderRadius:6, padding:'0.2rem 0.6rem', fontSize:'0.7rem', fontWeight:700, fontFamily:'system-ui,sans-serif' }}>
                        {formatDate(t.dateHeure)}
                      </div>
                      {t.marqueVoiture && (
                        <div style={{ position:'absolute', bottom:8, left:8, background:'rgba(0,0,0,0.6)', color:'white', borderRadius:4, padding:'0.15rem 0.5rem', fontSize:'0.7rem', fontWeight:600, fontFamily:'system-ui,sans-serif' }}>
                          {t.marqueVoiture}
                        </div>
                      )}
                    </div>

                    {/* Contenu */}
                    <div style={{ padding:'1rem' }}>
                      <div style={{ fontWeight:700, fontSize:'1rem', color:'#111827', fontFamily:'system-ui,sans-serif', marginBottom:'0.3rem', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
                        {t.villeDepart} → {t.villeArrivee}
                      </div>
                      <div style={{ fontSize:'0.78rem', color:'#6B7280', fontFamily:'system-ui,sans-serif', marginBottom:'0.8rem' }}>
                        à {formatTime(t.dateHeure)}
                      </div>
                      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                        <div style={{ display:'flex', alignItems:'center', gap:'0.5rem', minWidth:0 }}>
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
                          <div style={{ minWidth:0 }}>
                            <div style={{ fontWeight:600, fontSize:'0.8rem', color:'#111827', fontFamily:'system-ui,sans-serif', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{t.nomConducteur}</div>
                            <div style={{ fontSize:'0.7rem', color:'#F59E0B', fontFamily:'system-ui,sans-serif' }}>
                              ★ {t.noteConducteur > 0 ? parseFloat(t.noteConducteur).toFixed(1) : 'Nouveau'}
                            </div>
                          </div>
                        </div>
                        <div style={{ background:'#F3F4F6', borderRadius:6, padding:'0.2rem 0.6rem', fontSize:'0.73rem', color:'#374151', fontFamily:'system-ui,sans-serif', fontWeight:500, flexShrink:0 }}>
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

      {/*  Section Offres Livraison réelles */}
      <div style={{ background:'#FFF7F5', padding:'5rem 2rem', borderTop:'1px solid #FDE8E0' }}>
        <div style={{ maxWidth:1280, margin:'0 auto' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end', marginBottom:'2.5rem', flexWrap:'wrap', gap:'1rem' }}>
            <div>
              <div style={{ display:'inline-flex', alignItems:'center', gap:'0.5rem', background:'#FEF0EC', color:'#C2410C', padding:'0.35rem 1rem', borderRadius:50, fontSize:'0.78rem', fontWeight:700, marginBottom:'1rem' }}>
                <span style={{ width:5, height:5, background:'#C2410C', borderRadius:'50%' }} /> Livraison de colis
              </div>
              <h2 style={{ fontFamily:'Bricolage Grotesque,sans-serif', fontSize:'clamp(1.8rem, 4vw, 2.6rem)', fontWeight:800, color:'var(--dark)', margin:0 }}>
                Conducteurs disponibles <span style={{ color:'#C2410C' }}>pour vos colis</span>
              </h2>
              <p style={{ color:'var(--muted)', fontSize:'0.9rem', marginTop:'0.5rem', fontFamily:'system-ui,sans-serif' }}>
                Envoyez vos colis avec nos conducteurs vérifiés
              </p>
            </div>
            <Link to="/livraison"
              style={{ color:'#C2410C', fontWeight:600, textDecoration:'none', fontFamily:'system-ui,sans-serif', whiteSpace:'nowrap', flexShrink:0 }}>
              Voir toutes les offres →
            </Link>
          </div>

          {offresLoading ? (
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))', gap:'1rem' }}>
              {[1,2,3].map(i => <div key={i} style={{ background:'white', borderRadius:12, height:140, border:'1px solid #E5E7EB', opacity:0.5 }} />)}
            </div>
          ) : offres.length === 0 ? (
            <div style={{ textAlign:'center', padding:'3rem', color:'#6B7280', fontFamily:'system-ui,sans-serif', background:'white', borderRadius:16, border:'1px solid #E5E7EB' }}>
              <div style={{ fontSize:'2rem', marginBottom:'0.8rem' }}>📦</div>
              <div style={{ fontWeight:600, color:'#374151' }}>Aucune offre disponible pour le moment</div>
              <div style={{ fontSize:'0.85rem', marginTop:'0.5rem' }}>Les conducteurs publient régulièrement de nouvelles offres</div>
            </div>
          ) : (
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))', gap:'1.2rem' }}>
              {offres.map(o => (
                <Link key={o.id} to="/livraison" style={{ textDecoration:'none' }}>
                  <div
                    style={{ background:'white', borderRadius:12, border:'1px solid #E5E7EB', padding:'1.3rem', transition:'all 0.2s', cursor:'pointer' }}
                    onMouseEnter={e => { e.currentTarget.style.boxShadow='0 8px 24px rgba(194,65,12,0.1)'; e.currentTarget.style.borderColor='#FDBA74'; e.currentTarget.style.transform='translateY(-2px)' }}
                    onMouseLeave={e => { e.currentTarget.style.boxShadow='none'; e.currentTarget.style.borderColor='#E5E7EB'; e.currentTarget.style.transform='translateY(0)' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:'0.8rem', marginBottom:'0.9rem' }}>
                      <div style={{ width:44, height:44, borderRadius:'50%', background:'#FEF0EC', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.3rem', flexShrink:0 }}>📦</div>
                      <div style={{ minWidth:0 }}>
                        <div style={{ fontWeight:700, fontSize:'1rem', color:'#111827', fontFamily:'system-ui,sans-serif', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
                          {o.villeDepart} → {o.villeArrivee}
                        </div>
                        <div style={{ fontSize:'0.78rem', color:'#6B7280', fontFamily:'system-ui,sans-serif' }}>
                          {o.nomConducteur || 'Conducteur vérifié'}
                        </div>
                      </div>
                    </div>
                    <div style={{ display:'flex', gap:'0.5rem', flexWrap:'wrap', marginBottom:'0.8rem' }}>
                      <span style={{ background:'#FEF0EC', color:'#C2410C', padding:'0.2rem 0.6rem', borderRadius:6, fontSize:'0.75rem', fontWeight:600, fontFamily:'system-ui,sans-serif' }}>
                        {o.prixParKg} MAD/kg
                      </span>
                      <span style={{ background:'#F3F4F6', color:'#374151', padding:'0.2rem 0.6rem', borderRadius:6, fontSize:'0.75rem', fontWeight:500, fontFamily:'system-ui,sans-serif' }}>
                        Max {o.poidsMax} kg
                      </span>
                      <span style={{ background:'#F3F4F6', color:'#374151', padding:'0.2rem 0.6rem', borderRadius:6, fontSize:'0.75rem', fontWeight:500, fontFamily:'system-ui,sans-serif' }}>
                        {o.poidsRestant ?? o.poidsMax} kg restants
                      </span>
                    </div>
                    {o.description && (
                      <div style={{ fontSize:'0.78rem', color:'#6B7280', fontFamily:'system-ui,sans-serif', fontStyle:'italic' }}>{o.description}</div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      <Services />
      <Testimonials />
      <Footer />
    </>
  )
}