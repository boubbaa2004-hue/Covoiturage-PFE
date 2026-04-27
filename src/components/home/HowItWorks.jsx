const steps = [
  { num:'01', title:'Créez votre compte', desc:"Inscription gratuite et rapide. Les conducteurs soumettent leurs documents pour être vérifiés par notre équipe." },
  { num:'02', title:'Cherchez ou publiez', desc:"Trouvez un trajet disponible selon vos critères ou publiez votre propre annonce avec vos conditions." },
  { num:'03', title:'Négociez le tarif', desc:"Proposez votre prix ou acceptez celui affiché. Notre système de négociation vous permet de trouver le juste prix." },
  { num:'04', title:"Partez l'esprit tranquille", desc:"Pour les colis, le code OTP garantit une livraison sécurisée. Pour le covoiturage, bon voyage !" },
]
export default function HowItWorks() {
  return (
    <div style={{ background:'var(--gray)', padding:'5rem 3rem' }}>
      <div style={{ maxWidth:1280, margin:'0 auto' }}>
        <div style={{ marginBottom:'2.5rem' }}>
          <div style={{ display:'inline-flex', alignItems:'center', gap:'0.5rem', background:'var(--primary-light)', color:'var(--primary)', padding:'0.35rem 1rem', borderRadius:50, fontSize:'0.78rem', fontWeight:700, marginBottom:'1rem' }}>
            <span style={{ width:5, height:5, background:'var(--primary)', borderRadius:'50%', display:'inline-block' }} /> Comment ça marche
          </div>
          <h2 style={{ fontFamily:'Bricolage Grotesque, sans-serif', fontSize:'2.6rem', fontWeight:800, color:'var(--dark)', lineHeight:1.15, marginBottom:'0.8rem' }}>
            En 4 étapes <span style={{ color:'var(--primary)' }}>simples</span>
          </h2>
          <p style={{ color:'var(--muted)', fontSize:'1rem', lineHeight:1.7 }}>Que vous soyez passager, expéditeur ou conducteur, démarrez en moins de 5 minutes.</p>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(220px, 1fr))', gap:'1.5rem' }}>
          {steps.map(s => (
            <div key={s.num} style={{ background:'white', borderRadius:16, padding:'2rem 1.6rem', border:'1px solid var(--border)', transition:'all 0.25s' }}
              onMouseEnter={e => { e.currentTarget.style.transform='translateY(-5px)'; e.currentTarget.style.boxShadow='0 16px 40px rgba(0,0,0,0.08)' }}
              onMouseLeave={e => { e.currentTarget.style.transform='none'; e.currentTarget.style.boxShadow='none' }}>
              <div style={{ width:44, height:44, background:'var(--primary-light)', borderRadius:12, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'Bricolage Grotesque, sans-serif', fontWeight:800, fontSize:'1.1rem', color:'var(--primary)', marginBottom:'1.2rem' }}>{s.num}</div>
              <h3 style={{ fontFamily:'Bricolage Grotesque, sans-serif', fontWeight:700, fontSize:'1rem', color:'var(--dark)', marginBottom:'0.5rem' }}>{s.title}</h3>
              <p style={{ color:'var(--muted)', fontSize:'0.88rem', lineHeight:1.65 }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}