const services = [
  { ico:'🚗', title:'Covoiturage longue distance', desc:'Partagez vos trajets interurbains et divisez les frais. Béni Mellal ↔ Casablanca, Marrakech ↔ Rabat...', bg:'rgba(0,135,90,0.15)' },
  { ico:'📦', title:'Livraison sécurisée OTP', desc:'Envoyez vos colis avec un conducteur en déplacement. Validation par code OTP unique à la livraison.', bg:'rgba(255,107,53,0.15)' },
  { ico:'💬', title:'Négociation de tarif', desc:'Proposez votre prix, le conducteur accepte ou contre-propose. Le bon prix pour les deux parties.', bg:'rgba(255,181,71,0.15)' },
  { ico:'🛡️', title:'Conducteurs vérifiés', desc:"Chaque conducteur soumet ses documents d'identité. Notre équipe les vérifie avant toute activation.", bg:'rgba(99,153,34,0.15)' },
]
export default function Services() {
  return (
    <div style={{ background:'var(--dark)', padding:'5rem 3rem' }}>
      <div style={{ maxWidth:1280, margin:'0 auto' }}>
        <div style={{ marginBottom:'2.5rem' }}>
          <div style={{ display:'inline-flex', alignItems:'center', gap:'0.5rem', background:'rgba(0,135,90,0.2)', color:'#4ADE80', padding:'0.35rem 1rem', borderRadius:50, fontSize:'0.78rem', fontWeight:700, marginBottom:'1rem' }}>
            <span style={{ width:5, height:5, background:'#4ADE80', borderRadius:'50%' }} /> Nos services
          </div>
          <h2 style={{ fontFamily:'Bricolage Grotesque, sans-serif', fontSize:'2.6rem', fontWeight:800, color:'white', marginBottom:'0.8rem' }}>
            Tout ce dont vous <span style={{ color:'var(--gold)' }}>avez besoin</span>
          </h2>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(250px, 1fr))', gap:1, background:'rgba(255,255,255,0.08)', borderRadius:16, overflow:'hidden' }}>
          {services.map(s => (
            <div key={s.title} style={{ background:'var(--dark2)', padding:'2.2rem', transition:'background 0.2s', cursor:'pointer' }}
              onMouseEnter={e => e.currentTarget.style.background='#212D3F'}
              onMouseLeave={e => e.currentTarget.style.background='var(--dark2)'}>
              <div style={{ width:52, height:52, borderRadius:14, background:s.bg, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.5rem', marginBottom:'1.4rem' }}>{s.ico}</div>
              <h3 style={{ fontFamily:'Bricolage Grotesque, sans-serif', fontWeight:700, fontSize:'1.05rem', color:'white', marginBottom:'0.6rem' }}>{s.title}</h3>
              <p style={{ color:'rgba(255,255,255,0.5)', fontSize:'0.87rem', lineHeight:1.65, marginBottom:'1rem' }}>{s.desc}</p>
              <span style={{ color:'var(--gold)', fontSize:'0.82rem', fontWeight:600, cursor:'pointer' }}>En savoir plus →</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}