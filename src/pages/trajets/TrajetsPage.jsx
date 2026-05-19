import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../../components/layout/Header'
import Footer from '../../components/layout/Footer'
import { getTrajets, getUser, getToken } from '../../lib/api'

export default function TrajetsPage() {
  const user = getUser()
  const navigate = useNavigate()
  const [onglet, setOnglet] = useState('covoiturage')
  const [trajets, setTrajets] = useState([])
  const [offres, setOffres] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState({ depart:'', arrivee:'' })
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [colisForm, setColisForm] = useState({
    description:'', poids:'', villeDepart:'', villeArrivee:'',
    nomDestinataire:'', telephoneDestinataire:'', offreLivraisonId:''
  })
  const [colisSuccess, setColisSuccess] = useState('')
  const [colisError, setColisError] = useState('')
  const [colisLoading, setColisLoading] = useState(false)
  const [selectedOffre, setSelectedOffre] = useState(null)

  useEffect(() => { chargerDonnees() }, [])

  const chargerDonnees = async () => {
    setLoading(true)
    try {
      const t = await getTrajets()
      setTrajets(Array.isArray(t) ? t : [])
      try {
        const headers = {}
        const token = getToken()
        if (token) headers['Authorization'] = `Bearer ${token}`
        const res = await fetch('http://localhost:8080/api/offres-livraison/disponibles', { headers })
        if (res.ok) setOffres(await res.json())
      } catch (e) {}
    } catch (e) {}
    finally { setLoading(false) }
  }

  const handleEnvoyerColis = async () => {
    // Protection — doit être connecté
    if (!user) { setShowLoginModal(true); return }
    if (!colisForm.description || !colisForm.poids || !colisForm.villeDepart ||
        !colisForm.villeArrivee || !colisForm.nomDestinataire || !colisForm.telephoneDestinataire) {
      setColisError('Veuillez remplir tous les champs'); return
    }
    setColisLoading(true)
    setColisError('')
    try {
      const res = await fetch('http://localhost:8080/api/colis', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${getToken()}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...colisForm,
          poids: parseFloat(colisForm.poids),
          offreLivraisonId: selectedOffre?.id
        })
      })
      if (!res.ok) throw new Error()
      navigate('/dashboard/client?tab=colis')
    } catch (e) { setColisError('Erreur lors de la soumission') }
    finally { setColisLoading(false) }
  }

  //  Handler centralisé pour cliquer sur un trajet
  const handleClickTrajet = (trajetId) => {
    if (!user) {
      setShowLoginModal(true)
      return
    }
    navigate(`/trajets/${trajetId}`)
  }

  // Handler pour sélectionner une offre de livraison
  const handleSelectOffre = (offre) => {
    if (!user) {
      setShowLoginModal(true)
      return
    }
    setSelectedOffre(offre)
    setColisForm(f => ({
      ...f,
      villeDepart: offre.villeDepart,
      villeArrivee: offre.villeArrivee,
      offreLivraisonId: offre.id
    }))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const trajetsFiltres = trajets.filter(t => {
    const d = search.depart.toLowerCase()
    const a = search.arrivee.toLowerCase()
    return (!d || t.villeDepart?.toLowerCase().includes(d)) &&
           (!a || t.villeArrivee?.toLowerCase().includes(a))
  })

  const offresFiltrees = offres.filter(o => {
    const d = search.depart.toLowerCase()
    const a = search.arrivee.toLowerCase()
    return (!d || o.villeDepart?.toLowerCase().includes(d)) &&
           (!a || o.villeArrivee?.toLowerCase().includes(a))
  })

  const inputStyle = { padding:'0.75rem 1rem', border:'1px solid #D1D5DB', borderRadius:8, fontSize:'0.88rem', outline:'none', fontFamily:'system-ui,sans-serif', color:'#111827', background:'white' }
  const labelStyle = { fontSize:'0.72rem', fontWeight:600, color:'#374151', textTransform:'uppercase', letterSpacing:'0.4px', display:'block', marginBottom:'0.35rem', fontFamily:'system-ui,sans-serif' }

  return (
    <>
      <Header />
      <div style={{ marginTop:108, background:'#F9FAFB', minHeight:'100vh' }}>

        {/* Hero recherche */}
        <div style={{ background:'#111827', padding:'2rem 3rem' }}>
          <div style={{ maxWidth:1280, margin:'0 auto' }}>
            <div style={{ marginBottom:'1.5rem' }}>
              <div style={{ display:'inline-flex', alignItems:'center', gap:'0.4rem', background:'rgba(255,255,255,0.12)', color:'white', padding:'0.25rem 0.8rem', borderRadius:50, fontSize:'0.75rem', fontWeight:500, fontFamily:'system-ui,sans-serif', marginBottom:8 }}>
                <span style={{ width:5, height:5, background:'#00875A', borderRadius:'50%' }} />
                Trouvez votre trajet
              </div>
              <h1 style={{ fontWeight:800, fontSize:'1.8rem', color:'white', fontFamily:'system-ui,sans-serif', margin:0 }}>
                Trajets disponibles
              </h1>
            </div>

            {/* Onglets */}
            <div style={{ display:'flex', gap:'0.6rem', marginBottom:'1.2rem' }}>
              {[['covoiturage','🚗 Covoiturage'],['livraison','📦 Livraison de colis']].map(([key, label]) => (
                <button key={key} onClick={() => setOnglet(key)}
                  style={{
                    padding:'0.5rem 1.2rem', borderRadius:8, border:'none',
                    background: onglet===key ? (key==='livraison' ? '#C2410C' : '#00875A') : 'rgba(255,255,255,0.12)',
                    color:'white', fontWeight:600, fontSize:'0.88rem',
                    cursor:'pointer', fontFamily:'system-ui,sans-serif', transition:'all 0.2s'
                  }}>
                  {label}
                </button>
              ))}
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
                style={{ padding:'0.75rem 1.8rem', background: onglet==='livraison' ? '#C2410C' : '#00875A', color:'white', border:'none', borderRadius:8, fontWeight:600, fontSize:'0.88rem', cursor:'pointer', fontFamily:'system-ui,sans-serif' }}>
                Rechercher
              </button>
            </div>
          </div>
        </div>

        <div style={{ maxWidth:1280, margin:'0 auto', padding:'2rem 3rem' }}>

          {/* === ONGLET COVOITURAGE === */}
          {onglet === 'covoiturage' && (
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
                  style={{ background:'white', borderRadius:12, border:'1px solid #E5E7EB', padding:'1.2rem 1.5rem', cursor:'pointer', transition:'all 0.2s', boxShadow:'0 1px 3px rgba(0,0,0,0.04)', position:'relative' }}
                  onMouseEnter={e => { e.currentTarget.style.boxShadow='0 4px 16px rgba(0,135,90,0.1)'; e.currentTarget.style.borderColor='#A7F3D0' }}
                  onMouseLeave={e => { e.currentTarget.style.boxShadow='0 1px 3px rgba(0,0,0,0.04)'; e.currentTarget.style.borderColor='#E5E7EB' }}>

                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:'1rem' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:'1rem' }}>
                      {/* Photo profil */}
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
                        {/*  Bouton Réserver protégé */}
                        <button
                          onClick={() => handleClickTrajet(t.id)}
                          style={{
                            background:'#00875A', color:'white', border:'none',
                            borderRadius:8, padding:'0.5rem 1.2rem',
                            fontWeight:600, fontSize:'0.83rem',
                            cursor:'pointer', fontFamily:'system-ui,sans-serif',
                            transition:'all 0.2s'
                          }}
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
          )}

          {/* === ONGLET LIVRAISON === */}
          {onglet === 'livraison' && (
            <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
              <div style={{ fontWeight:600, fontSize:'0.9rem', color:'#374151', fontFamily:'system-ui,sans-serif' }}>
                {offresFiltrees.length} offre(s) de livraison disponible(s)
              </div>

              {/* Formulaire envoi colis si offre sélectionnée */}
              {selectedOffre && (
                <div style={{ background:'white', borderRadius:12, border:'2px solid #C2410C', padding:'1.5rem', boxShadow:'0 4px 16px rgba(194,65,12,0.1)' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.2rem' }}>
                    <div>
                      <div style={{ display:'inline-flex', alignItems:'center', gap:'0.4rem', background:'#FEF0EC', color:'#C2410C', padding:'0.2rem 0.7rem', borderRadius:50, fontSize:'0.72rem', fontWeight:600, marginBottom:6, fontFamily:'system-ui,sans-serif' }}>
                        <span style={{ width:4, height:4, background:'#C2410C', borderRadius:'50%' }} /> Envoi de colis
                      </div>
                      <div style={{ fontWeight:700, fontSize:'1rem', color:'#111827', fontFamily:'system-ui,sans-serif' }}>
                        {selectedOffre.villeDepart} → {selectedOffre.villeArrivee}
                      </div>
                      <div style={{ fontSize:'0.78rem', color:'#6B7280', fontFamily:'system-ui,sans-serif' }}>
                        Conducteur : {selectedOffre.nomConducteur} · {selectedOffre.prixParKg} MAD/kg · Max {selectedOffre.poidsMax} kg
                      </div>
                    </div>
                    <button onClick={() => setSelectedOffre(null)}
                      style={{ background:'#F3F4F6', border:'none', width:32, height:32, borderRadius:'50%', cursor:'pointer', fontSize:'1.1rem', color:'#6B7280', display:'flex', alignItems:'center', justifyContent:'center' }}>×</button>
                  </div>

                  {colisSuccess && (
                    <div style={{ background:'#E8F5F0', color:'#00875A', padding:'0.8rem 1rem', borderRadius:8, marginBottom:'1rem', fontSize:'0.83rem', fontFamily:'system-ui,sans-serif', border:'1px solid #A7F3D0', fontWeight:600 }}>
                      ✓ {colisSuccess}
                    </div>
                  )}
                  {colisError && (
                    <div style={{ background:'#FEF2F2', color:'#7F1D1D', padding:'0.7rem', borderRadius:8, fontSize:'0.82rem', marginBottom:'1rem', fontFamily:'system-ui,sans-serif', border:'1px solid #FECACA' }}>{colisError}</div>
                  )}

                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.9rem', marginBottom:'0.9rem' }}>
                    {[['Ville de départ *','villeDepart','Ex: Béni Mellal'],['Destination *','villeArrivee','Ex: Casablanca']].map(([label,key,placeholder]) => (
                      <div key={key}>
                        <label style={labelStyle}>{label}</label>
                        <input type="text" placeholder={placeholder} value={colisForm[key]}
                          onChange={e => setColisForm({...colisForm, [key]: e.target.value})}
                          style={{ ...inputStyle, width:'100%' }} />
                      </div>
                    ))}
                  </div>
                  {[
                    ['Description *','text','description','Ex: Vêtements, documents...'],
                    ['Poids (kg) *','number','poids','Ex: 2'],
                    ['Nom destinataire *','text','nomDestinataire','Prénom Nom'],
                    ['Téléphone destinataire *','tel','telephoneDestinataire','06 XX XX XX XX'],
                  ].map(([label,type,key,placeholder]) => (
                    <div key={key} style={{ marginBottom:'0.9rem' }}>
                      <label style={labelStyle}>{label}</label>
                      <input type={type} placeholder={placeholder} value={colisForm[key]}
                        onChange={e => setColisForm({...colisForm, [key]: e.target.value})}
                        style={{ ...inputStyle, width:'100%' }} />
                    </div>
                  ))}

                  <div style={{ background:'#FEF9C3', border:'1px solid #FDE68A', borderRadius:8, padding:'0.7rem 1rem', marginBottom:'1rem', fontSize:'0.8rem', color:'#713F12', fontFamily:'system-ui,sans-serif' }}>
                    Le conducteur vous proposera un prix selon le poids. Vous pourrez accepter ou négocier dans votre dashboard.
                  </div>

                  <button onClick={handleEnvoyerColis} disabled={colisLoading}
                    style={{ width:'100%', padding:'0.85rem', background: colisLoading ? '#9CA3AF' : '#C2410C', color:'white', border:'none', borderRadius:8, fontSize:'0.9rem', fontWeight:600, cursor: colisLoading ? 'not-allowed' : 'pointer', fontFamily:'system-ui,sans-serif' }}>
                    {colisLoading ? 'Envoi...' : 'Envoyer ma demande de colis'}
                  </button>
                </div>
              )}

              {/* Liste des offres */}
              {loading ? (
                <div style={{ display:'flex', flexDirection:'column', gap:'0.8rem' }}>
                  {[1,2,3].map(i => <div key={i} style={{ height:100, background:'white', borderRadius:12, border:'1px solid #E5E7EB', opacity:0.4 }} />)}
                </div>
              ) : offresFiltrees.length === 0 ? (
                <div style={{ background:'white', borderRadius:12, padding:'3rem', textAlign:'center', border:'1px solid #E5E7EB' }}>
                  <div style={{ fontSize:'2rem', marginBottom:'0.8rem' }}>📦</div>
                  <div style={{ fontWeight:600, color:'#374151', fontFamily:'system-ui,sans-serif', marginBottom:'0.5rem' }}>Aucune offre de livraison disponible</div>
                  <div style={{ fontSize:'0.83rem', color:'#6B7280', fontFamily:'system-ui,sans-serif' }}>Les conducteurs peuvent publier leurs offres depuis leur dashboard.</div>
                </div>
              ) : offresFiltrees.map(o => (
                <div key={o.id}
                  style={{ background:'white', borderRadius:12, border: selectedOffre?.id===o.id ? '2px solid #C2410C' : '1px solid #E5E7EB', padding:'1.2rem 1.5rem', transition:'all 0.2s', boxShadow:'0 1px 3px rgba(0,0,0,0.04)' }}
                  onMouseEnter={e => { e.currentTarget.style.boxShadow='0 4px 16px rgba(194,65,12,0.1)'; e.currentTarget.style.borderColor='#FDBA74' }}
                  onMouseLeave={e => {
                    e.currentTarget.style.boxShadow='0 1px 3px rgba(0,0,0,0.04)'
                    e.currentTarget.style.borderColor = selectedOffre?.id===o.id ? '#C2410C' : '#E5E7EB'
                  }}>

                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:'1rem' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:'1rem' }}>
                      <div style={{ width:48, height:48, borderRadius:'50%', background:'#FEF0EC', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.4rem', flexShrink:0 }}>
                        📦
                      </div>
                      <div>
                        <div style={{ fontWeight:700, fontSize:'1rem', color:'#111827', fontFamily:'system-ui,sans-serif' }}>
                          {o.villeDepart} → {o.villeArrivee}
                        </div>
                        <div style={{ fontSize:'0.78rem', color:'#6B7280', marginTop:2, fontFamily:'system-ui,sans-serif' }}>
                          Conducteur : <strong style={{ color:'#374151' }}>{o.nomConducteur || 'Conducteur'}</strong>
                          {o.description ? ` · ${o.description}` : ''}
                        </div>
                        <div style={{ fontSize:'0.75rem', color:'#374151', marginTop:3, fontFamily:'system-ui,sans-serif' }}>
                          <span style={{ background:'#FEF0EC', color:'#C2410C', padding:'0.15rem 0.5rem', borderRadius:4, fontWeight:600, marginRight:6 }}>
                            {o.prixParKg} MAD/kg
                          </span>
                          <span style={{ background:'#F3F4F6', color:'#374151', padding:'0.15rem 0.5rem', borderRadius:4, fontWeight:500, marginRight:6 }}>
                            Max {o.poidsMax} kg
                          </span>
                          <span style={{ background:'#F3F4F6', color:'#374151', padding:'0.15rem 0.5rem', borderRadius:4, fontWeight:500 }}>
                            {o.poidsRestant ?? o.poidsMax} kg restants
                          </span>
                        </div>
                      </div>
                    </div>

                    <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:'0.5rem' }}>
                      <div style={{ fontWeight:800, fontSize:'1.2rem', color:'#C2410C', fontFamily:'system-ui,sans-serif' }}>
                        {o.prixParKg} MAD/kg
                      </div>
                      {/*  Bouton Envoyer un colis protégé */}
                      <button
                        onClick={() => handleSelectOffre(o)}
                        style={{
                          background:'#C2410C', color:'white', border:'none',
                          borderRadius:8, padding:'0.5rem 1.2rem',
                          fontWeight:600, fontSize:'0.83rem',
                          cursor:'pointer', fontFamily:'system-ui,sans-serif',
                          transition:'all 0.2s'
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background='#9A3412'; e.currentTarget.style.transform='translateY(-1px)' }}
                        onMouseLeave={e => { e.currentTarget.style.background='#C2410C'; e.currentTarget.style.transform='translateY(0)' }}>
                        {user ? 'Envoyer un colis' : '🔐 Se connecter'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/*  Modal connexion requise */}
      {showLoginModal && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.55)', zIndex:2000, display:'flex', alignItems:'center', justifyContent:'center', padding:'1rem' }}>
          <div style={{ background:'white', borderRadius:14, padding:'2rem', maxWidth:380, width:'100%', textAlign:'center', boxShadow:'0 24px 64px rgba(0,0,0,0.25)' }}>
            <div style={{ fontSize:'2.5rem', marginBottom:'0.8rem' }}>🔐</div>
            <div style={{ fontWeight:700, fontSize:'1.1rem', color:'#111827', marginBottom:'0.5rem', fontFamily:'system-ui,sans-serif' }}>
              Connexion requise
            </div>
            <div style={{ fontSize:'0.83rem', color:'#6B7280', marginBottom:'1.5rem', fontFamily:'system-ui,sans-serif', lineHeight:1.6 }}>
              Vous devez être connecté pour réserver un trajet ou envoyer un colis.
            </div>
            <div style={{ display:'flex', gap:'0.8rem', justifyContent:'center' }}>
              <button
                onClick={() => { setShowLoginModal(false); navigate('/connexion') }}
                style={{ background:'#00875A', color:'white', border:'none', borderRadius:8, padding:'0.7rem 1.5rem', fontWeight:600, cursor:'pointer', fontFamily:'system-ui,sans-serif', fontSize:'0.88rem' }}>
                Se connecter
              </button>
              <button
                onClick={() => { setShowLoginModal(false); navigate('/inscription') }}
                style={{ background:'#111827', color:'white', border:'none', borderRadius:8, padding:'0.7rem 1.5rem', fontWeight:600, cursor:'pointer', fontFamily:'system-ui,sans-serif', fontSize:'0.88rem' }}>
                S'inscrire
              </button>
              <button
                onClick={() => setShowLoginModal(false)}
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