const reviews = [
  { text:"J'envoie des colis chaque semaine de Béni Mellal à Casa. Le code OTP me rassure totalement. Rapide, pas cher, et les conducteurs sont vraiment sérieux.", name:'Hamid M.', role:'Commerçant, Béni Mellal', initials:'HM' },
  { text:"Je propose des trajets régulièrement sur CovoitGo. La négociation de prix est parfaite et je gagne facilement sur mes trajets quotidiens. Meilleure appli du genre.", name:'Amine K.', role:'Conducteur vérifié, Marrakech', initials:'AK' },
  { text:"Interface très simple. J'ai trouvé un trajet Marrakech-Rabat en moins de 3 minutes, négocié le prix et c'était réglé. Je recommande vivement à tout le monde.", name:'Nadia B.', role:'Étudiante, Marrakech', initials:'NB' },
]
export default function Testimonials() {
  return (
    <div style={{ background:'var(--gray)', padding:'5rem 3rem' }}>
      <div style={{ maxWidth:1280, margin:'0 auto' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end', marginBottom:'2.5rem', flexWrap:'wrap', gap:'1rem' }}>
          <div>
            <div style={{ display:'inline-flex', alignItems:'center', gap:'0.5rem', background:'var(--primary-light)', color:'var(--primary)', padding:'0.35rem 1rem', borderRadius:50, fontSize:'0.78rem', fontWeight:700, marginBottom:'1rem' }}>
              <span style={{ width:5, height:5, background:'var(--primary)', borderRadius:'50%' }} /> Témoignages
            </div>
            <h2 style={{ fontFamily:'Bricolage Grotesque, sans-serif', fontSize:'2.6rem', fontWeight:800, color:'var(--dark)' }}>
              Ils nous <span style={{ color:'var(--primary)' }}>font confiance</span>
            </h2>
          </div>
          <a href="#" style={{ color:'var(--primary)', fontWeight:600, textDecoration:'none' }}>Lire tous les avis →</a>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(300px, 1fr))', gap:'1.5rem' }}>
          {reviews.map(r => (
            <div key={r.name} style={{ background:'white', borderRadius:16, padding:'1.8rem', border:'1px solid var(--border)', transition:'all 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow='0 8px 32px rgba(0,0,0,0.07)'; e.currentTarget.style.transform='translateY(-2px)' }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow='none'; e.currentTarget.style.transform='none' }}>
              <div style={{ marginBottom:'1rem', color:'var(--gold)', fontSize:'0.9rem', letterSpacing:2 }}>★★★★★</div>
              <p style={{ color:'#374151', fontSize:'0.92rem', lineHeight:1.72, marginBottom:'1.3rem', fontStyle:'italic' }}>"{r.text}"</p>
              <div style={{ display:'flex', alignItems:'center', gap:'0.8rem' }}>
                <div style={{ width:42, height:42, borderRadius:'50%', background:'var(--primary-light)', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, fontSize:'0.85rem', color:'var(--primary)' }}>{r.initials}</div>
                <div>
                  <div style={{ fontWeight:600, fontSize:'0.88rem', color:'var(--dark)' }}>{r.name}</div>
                  <div style={{ fontSize:'0.77rem', color:'var(--muted)' }}>{r.role}</div>
                  <span style={{ display:'inline-flex', background:'var(--primary-light)', color:'var(--primary)', padding:'0.2rem 0.6rem', borderRadius:4, fontSize:'0.7rem', fontWeight:600, marginTop:2 }}>✓ Utilisateur vérifié</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}