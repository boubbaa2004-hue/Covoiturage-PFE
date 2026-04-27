const stats = [
  { icon:'👥', num:'12 400+', label:'Utilisateurs actifs' },
  { icon:'🚗', num:'850+', label:'Conducteurs vérifiés' },
  { icon:'🗺️', num:'45+', label:'Villes couvertes' },
  { icon:'📦', num:'3 200+', label:'Colis livrés' },
  { icon:'⭐', num:'4.8 / 5', label:'Note moyenne' },
]
export default function StatsBar() {
  return (
    <div style={{ background:'white', borderBottom:'1px solid var(--border)', padding:'1.8rem 3rem' }}>
      <div style={{ maxWidth:1280, margin:'0 auto', display:'flex', justifyContent:'space-around', alignItems:'center', flexWrap:'wrap', gap:'1rem' }}>
        {stats.map((s, i) => (
          <div key={i} style={{ display:'flex', alignItems:'center', gap:'1rem' }}>
            <div style={{ width:46, height:46, borderRadius:12, background:'var(--primary-light)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.2rem' }}>{s.icon}</div>
            <div>
              <div style={{ fontFamily:'Bricolage Grotesque, sans-serif', fontSize:'1.6rem', fontWeight:800, lineHeight:1 }}>{s.num}</div>
              <div style={{ fontSize:'0.78rem', color:'var(--muted)', marginTop:2 }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}