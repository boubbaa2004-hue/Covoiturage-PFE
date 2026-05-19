import { Link } from 'react-router-dom'

export default function Footer() {
  const cols = [
    {
      title:'Services',
      links:[
        { label:'Covoiturage', to:'/trajets' },
        { label:'Livraison colis', to:'/livraison' },
        { label:'Suivre un colis', to:'/livraison' },
        { label:'Devenir conducteur', to:'/auth/register' },
      ]
    },
    {
      title:'Entreprise',
      links:[
        { label:'À propos', to:'/' },
        { label:'Notre équipe', to:'/' },
        { label:'Université USMS', href:'https://www.usms.ac.ma', externe:true },
      ]
    },
    {
      title:'Support',
      links:[
        { label:'Contact', to:'/' },
        { label:'Signaler un problème', to:'/' },
        { label:'FAQ', to:'/' },
      ]
    },
  ]

  const socials = [
    { label:'f', href:'https://facebook.com', title:'Facebook' },
    { label:'in', href:'https://linkedin.com', title:'LinkedIn' },
    { label:'tw', href:'https://twitter.com', title:'Twitter' },
    { label:'ig', href:'https://instagram.com', title:'Instagram' },
  ]

  return (
    <footer style={{ background:'var(--dark)', color:'white', padding:'4rem 2rem 0' }}>
      <div style={{ maxWidth:1280, margin:'0 auto', display:'grid', gridTemplateColumns:'2fr 1fr 1fr 1fr', gap:'3rem', paddingBottom:'3rem', borderBottom:'1px solid rgba(255,255,255,0.08)' }}>

        {/* Brand */}
        <div>
          <div style={{ fontFamily:'Bricolage Grotesque, sans-serif', fontWeight:800, fontSize:'1.4rem', color:'white', marginBottom:'1rem', display:'flex', alignItems:'center', gap:'0.5rem' }}>
            <div style={{ width:30, height:30, background:'var(--primary)', borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center', fontWeight:800 }}>C</div>
            Covoit<em style={{ color:'var(--accent)', fontStyle:'normal' }}>Go</em>
          </div>
          <p style={{ color:'rgba(255,255,255,0.45)', fontSize:'0.88rem', lineHeight:1.7, marginBottom:'1.5rem', maxWidth:280, fontFamily:'system-ui,sans-serif' }}>
            La première plateforme marocaine de covoiturage et livraison de colis. Simple, sécurisée et collaborative.
          </p>
          {/* Réseaux sociaux fonctionnels */}
          <div style={{ display:'flex', gap:'0.6rem' }}>
            {socials.map(s => (
              <a key={s.label} href={s.href} target="_blank" rel="noreferrer" title={s.title}
                style={{ width:36, height:36, background:'rgba(255,255,255,0.07)', borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center', color:'rgba(255,255,255,0.6)', fontSize:'0.85rem', border:'1px solid rgba(255,255,255,0.08)', textDecoration:'none', transition:'background 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.background='rgba(255,255,255,0.15)'}
                onMouseLeave={e => e.currentTarget.style.background='rgba(255,255,255,0.07)'}>
                {s.label}
              </a>
            ))}
          </div>
        </div>

        {/* Colonnes */}
        {cols.map(col => (
          <div key={col.title}>
            <h4 style={{ fontWeight:600, fontSize:'0.88rem', color:'rgba(255,255,255,0.9)', marginBottom:'1.2rem', textTransform:'uppercase', letterSpacing:'0.5px', fontFamily:'system-ui,sans-serif' }}>{col.title}</h4>
            <ul style={{ listStyle:'none', display:'flex', flexDirection:'column', gap:'0.7rem', padding:0, margin:0 }}>
              {col.links.map(l => (
                <li key={l.label}>
                  {l.externe ? (
                    <a href={l.href} target="_blank" rel="noreferrer"
                      style={{ color:'rgba(255,255,255,0.45)', fontSize:'0.88rem', textDecoration:'none', fontFamily:'system-ui,sans-serif', transition:'color 0.15s' }}
                      onMouseEnter={e => e.currentTarget.style.color='white'}
                      onMouseLeave={e => e.currentTarget.style.color='rgba(255,255,255,0.45)'}>
                      {l.label} ↗
                    </a>
                  ) : (
                    <Link to={l.to}
                      style={{ color:'rgba(255,255,255,0.45)', fontSize:'0.88rem', textDecoration:'none', fontFamily:'system-ui,sans-serif', transition:'color 0.15s' }}
                      onMouseEnter={e => e.currentTarget.style.color='white'}
                      onMouseLeave={e => e.currentTarget.style.color='rgba(255,255,255,0.45)'}>
                      {l.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Bas du footer */}
      <div style={{ maxWidth:1280, margin:'0 auto', display:'flex', alignItems:'center', justifyContent:'space-between', padding:'1.5rem 0', flexWrap:'wrap', gap:'1rem' }}>
        <p style={{ color:'rgba(255,255,255,0.3)', fontSize:'0.82rem', fontFamily:'system-ui,sans-serif', margin:0 }}>
          © 2026 CovoitGo — Université Sultan Moulay Slimane de Béni Mellal
        </p>
        {/*  Pages légales */}
        <div style={{ display:'flex', gap:'1.5rem', flexWrap:'wrap' }}>
          {["Conditions d'utilisation", 'Confidentialité', 'Cookies'].map(l => (
            <Link key={l} to="/"
              style={{ color:'rgba(255,255,255,0.3)', fontSize:'0.82rem', textDecoration:'none', fontFamily:'system-ui,sans-serif', transition:'color 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.color='rgba(255,255,255,0.7)'}
              onMouseLeave={e => e.currentTarget.style.color='rgba(255,255,255,0.3)'}>
              {l}
            </Link>
          ))}
        </div>
        <div style={{ color:'rgba(255,255,255,0.4)', fontSize:'0.82rem', fontFamily:'system-ui,sans-serif' }}>🌍 Français</div>
      </div>
    </footer>
  )
}