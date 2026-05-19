import { useState, useEffect } from 'react'

export default function StatsBar() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    //  Stats réelles depuis le backend
    fetch('http://localhost:8080/api/admin/stats-public')
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data) setStats(data)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const items = [
    { icon:'👥', num: stats?.totalUtilisateurs ?? '—', label:'Utilisateurs actifs' },
    { icon:'🚗', num: stats?.totalConducteurs ?? '—', label:'Conducteurs vérifiés' },
    { icon:'🗺️', num: '45+', label:'Villes couvertes' },
    { icon:'📦', num: stats?.totalColisLivres ?? '—', label:'Colis livrés' },
    { icon:'⭐', num: stats?.noteMoyenne ? `${parseFloat(stats.noteMoyenne).toFixed(1)} / 5` : '— / 5', label:'Note moyenne' },
  ]

  return (
    <div style={{ background:'white', borderBottom:'1px solid var(--border)', padding:'1.8rem 2rem' }}>
      <div style={{ maxWidth:1280, margin:'0 auto', display:'flex', justifyContent:'space-around', alignItems:'center', flexWrap:'wrap', gap:'1.5rem' }}>
        {items.map((s, i) => (
          <div key={i} style={{ display:'flex', alignItems:'center', gap:'1rem' }}>
            <div style={{ width:46, height:46, borderRadius:12, background:'var(--primary-light)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.2rem', flexShrink:0 }}>{s.icon}</div>
            <div>
              <div style={{ fontFamily:'Bricolage Grotesque, sans-serif', fontSize:'1.6rem', fontWeight:800, lineHeight:1, color:'var(--dark)' }}>
                {loading ? <span style={{ display:'inline-block', width:60, height:20, background:'#E5E7EB', borderRadius:4 }} /> : s.num}
              </div>
              <div style={{ fontSize:'0.78rem', color:'var(--muted)', marginTop:2, fontFamily:'system-ui,sans-serif' }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}