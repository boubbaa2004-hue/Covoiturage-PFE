import { useState } from 'react'
import { Link } from 'react-router-dom'

export default function Hero() {
  const [activeTab, setActiveTab] = useState('covoiturage')

  return (
    <section style={{ marginTop:108, background:'var(--dark)', minHeight:'88vh', position:'relative', overflow:'hidden', display:'flex', alignItems:'center' }}>
      <div style={{ position:'absolute', inset:0, backgroundImage:"url('https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=1600&q=85&fit=crop')", backgroundSize:'cover', backgroundPosition:'center', filter:'brightness(0.35)' }} />
      <div style={{ position:'absolute', inset:0, background:'linear-gradient(105deg,rgba(0,94,55,0.85) 0%,rgba(0,0,0,0.4) 60%,transparent 100%)' }} />

      <div style={{ position:'relative', zIndex:2, maxWidth:1280, margin:'0 auto', padding:'4rem 3rem', display:'grid', gridTemplateColumns:'1.1fr 0.9fr', gap:'5rem', alignItems:'center', width:'100%' }}>
        <div>
          <div style={{ display:'inline-flex', alignItems:'center', gap:'0.5rem', background:'rgba(255,181,71,0.18)', border:'1px solid rgba(255,181,71,0.4)', color:'var(--gold)', padding:'0.45rem 1.1rem', borderRadius:50, fontSize:'0.8rem', fontWeight:600, marginBottom:'1.8rem' }}>
            <span style={{ width:7, height:7, background:'var(--gold)', borderRadius:'50%', display:'inline-block' }} />
            NOUVEAU — Livraison OTP disponible
          </div>
          <h1 style={{ fontFamily:'Bricolage Grotesque, sans-serif', fontSize:'3.8rem', fontWeight:800, color:'white', lineHeight:1.08, letterSpacing:'-1.5px', marginBottom:'1.3rem' }}>
            Voyagez malin,<br />
            <span style={{ color:'var(--gold)' }}>livrez en confiance</span>
          </h1>
          <p style={{ color:'rgba(255,255,255,0.72)', fontSize:'1.05rem', lineHeight:1.75, marginBottom:'2.2rem', fontWeight:300 }}>
            La première plateforme marocaine qui réunit covoiturage longue distance et livraison de colis sécurisée par code OTP.
          </p>
          <div style={{ display:'flex', gap:'1rem', marginBottom:'2.5rem', flexWrap:'wrap' }}>
            <Link to="/trajets" style={{ display:'inline-flex', alignItems:'center', gap:'0.6rem', background:'var(--primary)', color:'white', padding:'0.9rem 2.2rem', borderRadius:10, fontWeight:700, fontSize:'1rem', textDecoration:'none' }}>
              🚗 Trouver un trajet
            </Link>
            <Link to="/livraison" style={{ display:'inline-flex', alignItems:'center', gap:'0.6rem', background:'rgba(255,255,255,0.1)', color:'white', padding:'0.9rem 2rem', borderRadius:10, border:'1.5px solid rgba(255,255,255,0.25)', fontWeight:500, fontSize:'1rem', textDecoration:'none' }}>
              📦 Envoyer un colis
            </Link>
          </div>
          <div style={{ display:'flex', gap:'1.5rem', flexWrap:'wrap' }}>
            {['✓ Conducteurs vérifiés', '✓ Paiement sécurisé', '✓ 45+ villes'].map(t => (
              <span key={t} style={{ color:'rgba(255,255,255,0.6)', fontSize:'0.82rem' }}>{t}</span>
            ))}
          </div>
        </div>

        {/* Carte recherche */}
        <div style={{ background:'white', borderRadius:20, padding:'2rem', boxShadow:'0 24px 64px rgba(0,0,0,0.35)' }}>
          <div style={{ display:'flex', background:'var(--gray2)', borderRadius:10, padding:4, marginBottom:'1.5rem', gap:4 }}>
            {['covoiturage', 'livraison'].map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)} style={{ flex:1, padding:'0.6rem', borderRadius:7, fontSize:'0.85rem', fontWeight:600, cursor:'pointer', border:'none', background: activeTab===tab ? 'white' : 'transparent', color: activeTab===tab ? 'var(--primary)' : 'var(--muted)', boxShadow: activeTab===tab ? '0 2px 8px rgba(0,0,0,0.1)' : 'none' }}>
                {tab === 'covoiturage' ? '🚗 Covoiturage' : '📦 Livraison colis'}
              </button>
            ))}
          </div>

          {[['Départ','📍','Ex : Béni Mellal','text'],['Destination','🎯','Ex : Casablanca','text']].map(([label, icon, placeholder, type]) => (
            <div key={label} style={{ marginBottom:'1rem' }}>
              <label style={{ fontSize:'0.72rem', fontWeight:700, color:'var(--muted)', textTransform:'uppercase', letterSpacing:'0.8px', marginBottom:'0.4rem', display:'block' }}>{label}</label>
              <div style={{ position:'relative' }}>
                <span style={{ position:'absolute', left:'0.9rem', top:'50%', transform:'translateY(-50%)' }}>{icon}</span>
                <input type={type} placeholder={placeholder} style={{ width:'100%', padding:'0.85rem 1rem 0.85rem 2.8rem', border:'1.5px solid var(--border)', borderRadius:10, fontSize:'0.92rem', outline:'none', background:'var(--gray)', fontFamily:'inherit' }} />
              </div>
            </div>
          ))}

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.8rem', marginBottom:'1rem' }}>
            {[['Date','📅','date'],['Passagers','👤','number']].map(([label, icon, type]) => (
              <div key={label}>
                <label style={{ fontSize:'0.72rem', fontWeight:700, color:'var(--muted)', textTransform:'uppercase', letterSpacing:'0.8px', marginBottom:'0.4rem', display:'block' }}>{label}</label>
                <div style={{ position:'relative' }}>
                  <span style={{ position:'absolute', left:'0.9rem', top:'50%', transform:'translateY(-50%)' }}>{icon}</span>
                  <input type={type} defaultValue={type==='number'?1:undefined} min={type==='number'?1:undefined} style={{ width:'100%', padding:'0.85rem 1rem 0.85rem 2.8rem', border:'1.5px solid var(--border)', borderRadius:10, fontSize:'0.92rem', outline:'none', background:'var(--gray)', fontFamily:'inherit' }} />
                </div>
              </div>
            ))}
          </div>

          <button style={{ width:'100%', padding:'1rem', background:'var(--primary)', color:'white', border:'none', borderRadius:10, fontSize:'1rem', fontWeight:700, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:'0.6rem', fontFamily:'inherit' }}>
            🔍 Rechercher les trajets
          </button>

          <div style={{ marginTop:'1rem', paddingTop:'1rem', borderTop:'1px solid var(--border)' }}>
            <p style={{ fontSize:'0.75rem', color:'var(--muted)', marginBottom:'0.5rem' }}>Trajets populaires :</p>
            <div style={{ display:'flex', flexWrap:'wrap', gap:'0.4rem' }}>
              {['Béni Mellal → Casa', 'Marrakech → Rabat', 'Fès → Meknès', 'Agadir → Marrakech'].map(t => (
                <span key={t} style={{ padding:'0.3rem 0.75rem', background:'var(--primary-light)', color:'var(--primary)', borderRadius:20, fontSize:'0.78rem', fontWeight:600, cursor:'pointer' }}>{t}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}