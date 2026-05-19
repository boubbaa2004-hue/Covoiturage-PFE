import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

export default function Hero() {
  const navigate = useNavigate()
  const [search, setSearch] = useState({ villeDepart:'', villeArrivee:'', date:'' })

  const handleSearch = () => {
    if (!search.villeDepart || !search.villeArrivee) return
    navigate(`/trajets?depart=${encodeURIComponent(search.villeDepart)}&arrivee=${encodeURIComponent(search.villeArrivee)}`)
  }

  return (
    <section style={{ marginTop:108, minHeight:'88vh', position:'relative', overflow:'hidden', display:'flex', alignItems:'center', justifyContent:'center' }}>

      {/* Background */}
      <div style={{ position:'absolute', inset:0, backgroundImage:"url('https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=1600&q=85&fit=crop')", backgroundSize:'cover', backgroundPosition:'center', filter:'brightness(0.35)' }} />
      <div style={{ position:'absolute', inset:0, background:'linear-gradient(105deg,rgba(0,94,55,0.85) 0%,rgba(0,0,0,0.5) 100%)' }} />

      {/* Contenu centré */}
      <div style={{ position:'relative', zIndex:2, width:'100%', maxWidth:900, margin:'0 auto', padding:'0 2rem', textAlign:'center' }}>

        {/* Badge */}
        <div style={{ display:'inline-flex', alignItems:'center', gap:'0.5rem', background:'rgba(255,181,71,0.18)', border:'1px solid rgba(255,181,71,0.4)', color:'var(--gold)', padding:'0.45rem 1.1rem', borderRadius:50, fontSize:'0.8rem', fontWeight:600, marginBottom:'1.8rem' }}>
          <span style={{ width:7, height:7, background:'var(--gold)', borderRadius:'50%', display:'inline-block' }} />
          NOUVEAU — Livraison OTP disponible
        </div>

        {/* Titre */}
        <h1 style={{ fontFamily:'Bricolage Grotesque,sans-serif', fontSize:'3.8rem', fontWeight:800, color:'white', lineHeight:1.08, letterSpacing:'-1.5px', marginBottom:'1rem' }}>
          Voyagez malin,{' '}
          <span style={{ color:'var(--gold)' }}>livrez en confiance</span>
        </h1>

        {/* Sous-titre */}
        <p style={{ color:'rgba(255,255,255,0.72)', fontSize:'1.1rem', lineHeight:1.7, marginBottom:'2.5rem', fontWeight:300 }}>
          La première plateforme marocaine qui réunit covoiturage longue distance<br />
          et livraison de colis sécurisée par code OTP.
        </p>

        {/* Barre de recherche horizontale */}
        <div style={{ background:'white', borderRadius:16, padding:'0.4rem', display:'flex', alignItems:'center', boxShadow:'0 24px 64px rgba(0,0,0,0.35)', marginBottom:'1.5rem' }}>

          {/* Départ */}
          <div style={{ flex:1, display:'flex', alignItems:'center', gap:'0.5rem', padding:'0.7rem 1rem', borderRight:'1px solid #E5E7EB' }}>
            <span style={{ fontSize:'1.1rem', flexShrink:0 }}>📍</span>
            <input
              value={search.villeDepart}
              onChange={e => setSearch({...search, villeDepart: e.target.value})}
              onKeyDown={e => e.key==='Enter' && handleSearch()}
              placeholder="Départ"
              style={{ border:'none', background:'transparent', outline:'none', fontSize:'0.95rem', fontFamily:'inherit', width:'100%', color:'#111827' }}
            />
          </div>

          {/* Swap */}
          <button
            onClick={() => setSearch({...search, villeDepart: search.villeArrivee, villeArrivee: search.villeDepart})}
            style={{ padding:'0.5rem 0.7rem', background:'#F3F4F6', border:'none', borderRadius:8, cursor:'pointer', fontSize:'1rem', color:'#6B7280', flexShrink:0, margin:'0 0.2rem' }}>
            ⇄
          </button>

          {/* Arrivée */}
          <div style={{ flex:1, display:'flex', alignItems:'center', gap:'0.5rem', padding:'0.7rem 1rem', borderRight:'1px solid #E5E7EB', borderLeft:'1px solid #E5E7EB' }}>
            <span style={{ fontSize:'1.1rem', flexShrink:0 }}>📍</span>
            <input
              value={search.villeArrivee}
              onChange={e => setSearch({...search, villeArrivee: e.target.value})}
              onKeyDown={e => e.key==='Enter' && handleSearch()}
              placeholder="Arrivée"
              style={{ border:'none', background:'transparent', outline:'none', fontSize:'0.95rem', fontFamily:'inherit', width:'100%', color:'#111827' }}
            />
          </div>

          {/* Date */}
          <div style={{ display:'flex', alignItems:'center', gap:'0.5rem', padding:'0.7rem 1rem', borderRight:'1px solid #E5E7EB', minWidth:180 }}>
            <span style={{ fontSize:'1rem', flexShrink:0 }}>📅</span>
            <input
              type="date"
              value={search.date}
              onChange={e => setSearch({...search, date: e.target.value})}
              style={{ border:'none', background:'transparent', outline:'none', fontSize:'0.9rem', fontFamily:'inherit', color: search.date ? '#111827' : '#9CA3AF', width:'100%' }}
            />
          </div>

          {/* Bouton */}
          <button
            onClick={handleSearch}
            disabled={!search.villeDepart || !search.villeArrivee}
            style={{ margin:'0.3rem', padding:'0.85rem 1.8rem', background: (!search.villeDepart || !search.villeArrivee) ? '#9CA3AF' : '#0D1117', color:'white', border:'none', borderRadius:12, fontSize:'0.95rem', fontWeight:700, cursor: (!search.villeDepart || !search.villeArrivee) ? 'not-allowed' : 'pointer', fontFamily:'inherit', whiteSpace:'nowrap', flexShrink:0 }}>
            Trouver un trajet
          </button>
        </div>

        {/* Trajets populaires */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:'0.5rem', flexWrap:'wrap', marginBottom:'2.5rem' }}>
          <span style={{ color:'rgba(255,255,255,0.5)', fontSize:'0.82rem' }}>Trajets populaires :</span>
          {[['Béni Mellal','Casa'],['Marrakech','Rabat'],['Fès','Meknès'],['Agadir','Marrakech']].map(([dep, arr]) => (
            <button key={dep+arr}
              onClick={() => setSearch({...search, villeDepart:dep, villeArrivee:arr})}
              style={{ padding:'0.3rem 0.9rem', background:'rgba(255,255,255,0.12)', color:'rgba(255,255,255,0.85)', borderRadius:20, fontSize:'0.8rem', fontWeight:600, cursor:'pointer', border:'1px solid rgba(255,255,255,0.2)', fontFamily:'inherit' }}>
              {dep} → {arr}
            </button>
          ))}
        </div>

        {/* Boutons secondaires */}
        <div style={{ display:'flex', gap:'1rem', justifyContent:'center', flexWrap:'wrap', marginBottom:'2rem' }}>
          <Link to="/trajets" style={{ display:'inline-flex', alignItems:'center', gap:'0.6rem', background:'var(--primary)', color:'white', padding:'0.85rem 2rem', borderRadius:10, fontWeight:700, fontSize:'0.95rem', textDecoration:'none' }}>
            🚗 Voir tous les trajets
          </Link>
          <Link to="/livraison" style={{ display:'inline-flex', alignItems:'center', gap:'0.6rem', background:'rgba(255,255,255,0.1)', color:'white', padding:'0.85rem 1.8rem', borderRadius:10, border:'1.5px solid rgba(255,255,255,0.25)', fontWeight:500, fontSize:'0.95rem', textDecoration:'none' }}>
            📦 Envoyer un colis
          </Link>
        </div>

        {/* Stats */}
        <div style={{ display:'flex', gap:'2.5rem', justifyContent:'center', flexWrap:'wrap' }}>
          {['✓ Conducteurs vérifiés','✓ Paiement sécurisé','✓ Plus de 45 villes'].map(t => (
            <span key={t} style={{ color:'rgba(255,255,255,0.55)', fontSize:'0.82rem' }}>{t}</span>
          ))}
        </div>

      </div>
    </section>
  )
}