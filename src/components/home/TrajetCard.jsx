export default function TrajetCard({ type='covoiturage', from, to, date, seats, duration, driver, price, rating, image }) {
  return (
    <div style={{ borderRadius:16, overflow:'hidden', border:'1px solid var(--border)', background:'white', transition:'all 0.25s', cursor:'pointer' }}
      onMouseEnter={e => { e.currentTarget.style.transform='translateY(-5px)'; e.currentTarget.style.boxShadow='0 20px 50px rgba(0,0,0,0.1)' }}
      onMouseLeave={e => { e.currentTarget.style.transform='none'; e.currentTarget.style.boxShadow='none' }}>
      <div style={{ height:170, position:'relative', overflow:'hidden' }}>
        <img src={image} alt={`${from} ${to}`} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
        <span style={{ position:'absolute', top:12, left:12, padding:'0.3rem 0.8rem', borderRadius:6, fontSize:'0.73rem', fontWeight:700, background: type==='covoiturage' ? 'var(--primary)' : 'var(--accent)', color:'white' }}>
          {type === 'covoiturage' ? 'Covoiturage' : 'Livraison colis'}
        </span>
        <span style={{ position:'absolute', bottom:10, right:10, background:'rgba(0,0,0,0.7)', color:'white', padding:'0.25rem 0.6rem', borderRadius:6, fontSize:'0.75rem', fontWeight:600 }}>★ {rating}</span>
      </div>
      <div style={{ padding:'1.2rem' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'0.6rem', marginBottom:'0.7rem' }}>
          <span style={{ fontFamily:'Bricolage Grotesque, sans-serif', fontWeight:700, fontSize:'1rem', color:'var(--dark)' }}>{from}</span>
          <span style={{ color:'var(--primary)', fontWeight:700 }}>→</span>
          <span style={{ fontFamily:'Bricolage Grotesque, sans-serif', fontWeight:700, fontSize:'1rem', color:'var(--dark)' }}>{to}</span>
        </div>
        <div style={{ display:'flex', flexWrap:'wrap', gap:'0.6rem', marginBottom:'1rem' }}>
          {[date, seats, duration].map((chip, i) => (
            <span key={i} style={{ background:'var(--gray)', padding:'0.3rem 0.7rem', borderRadius:6, fontSize:'0.78rem', color:'var(--muted)', fontWeight:500 }}>{chip}</span>
          ))}
        </div>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', paddingTop:'1rem', borderTop:'1px solid var(--border)' }}>
          <div style={{ display:'flex', alignItems:'center', gap:'0.6rem' }}>
            <div style={{ width:34, height:34, borderRadius:'50%', background:'var(--primary-light)', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, fontSize:'0.8rem', color:'var(--primary)' }}>{driver.initials}</div>
            <div>
              <div style={{ fontSize:'0.85rem', fontWeight:600, color:'var(--dark)' }}>{driver.name}</div>
              <div style={{ fontSize:'0.72rem', color:'var(--primary)' }}>✓ Vérifié</div>
            </div>
          </div>
          <div style={{ fontFamily:'Bricolage Grotesque, sans-serif', fontSize:'1.3rem', fontWeight:800, color:'var(--dark)' }}>
            {price} <sub style={{ fontSize:'0.7rem', fontWeight:500, color:'var(--muted)', fontFamily:'inherit' }}>{type==='covoiturage' ? '/place' : '/colis'}</sub>
          </div>
        </div>
      </div>
    </div>
  )
}