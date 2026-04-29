export default function Footer() {
  const cols = [
    { title:'Services', links:['Covoiturage','Livraison colis','Négociation tarif','Devenir conducteur','Tarification'] },
    { title:'Entreprise', links:['À propos','Notre équipe','Blog','Presse','Carrières'] },
    { title:'Support', links:["Centre d'aide",'Contact','Sécurité','Signaler un problème','FAQ'] },
  ]
  return (
    <footer style={{ background:'var(--dark)', color:'white', padding:'4rem 3rem 0' }}>
      <div style={{ maxWidth:1280, margin:'0 auto', display:'grid', gridTemplateColumns:'2fr 1fr 1fr 1fr', gap:'3rem', paddingBottom:'3rem', borderBottom:'1px solid rgba(255,255,255,0.08)' }}>
        <div>
          <div style={{ fontFamily:'Bricolage Grotesque, sans-serif', fontWeight:800, fontSize:'1.4rem', color:'white', marginBottom:'1rem', display:'flex', alignItems:'center', gap:'0.5rem' }}>
            <div style={{ width:30, height:30, background:'var(--primary)', borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center', fontWeight:800 }}>C</div>
            Covoit<em style={{ color:'var(--accent)', fontStyle:'normal' }}>liv</em>
          </div>
          <p style={{ color:'rgba(255,255,255,0.45)', fontSize:'0.88rem', lineHeight:1.7, marginBottom:'1.5rem', maxWidth:280 }}>
            La première plateforme marocaine de covoiturage et livraison de colis. Simple, sécurisée et collaborative.
          </p>
          <div style={{ display:'flex', gap:'0.6rem' }}>
            {['f','in','tw','ig'].map(s => (
              <a key={s} href="#" style={{ width:36, height:36, background:'rgba(255,255,255,0.07)', borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center', color:'rgba(255,255,255,0.6)', fontSize:'0.85rem', border:'1px solid rgba(255,255,255,0.08)', textDecoration:'none' }}>{s}</a>
            ))}
          </div>
        </div>
        {cols.map(col => (
          <div key={col.title}>
            <h4 style={{ fontWeight:600, fontSize:'0.88rem', color:'rgba(255,255,255,0.9)', marginBottom:'1.2rem', textTransform:'uppercase', letterSpacing:'0.5px' }}>{col.title}</h4>
            <ul style={{ listStyle:'none', display:'flex', flexDirection:'column', gap:'0.7rem' }}>
              {col.links.map(l => <li key={l}><a href="#" style={{ color:'rgba(255,255,255,0.45)', fontSize:'0.88rem', textDecoration:'none' }}>{l}</a></li>)}
            </ul>
          </div>
        ))}
      </div>
      <div style={{ maxWidth:1280, margin:'0 auto', display:'flex', alignItems:'center', justifyContent:'space-between', padding:'1.5rem 0', flexWrap:'wrap', gap:'1rem' }}>
        <p style={{ color:'rgba(255,255,255,0.3)', fontSize:'0.82rem' }}>© 2026 CovoitGo — Université Sultan Moulay Slimane de Béni Mellal</p>
        <div style={{ display:'flex', gap:'1.5rem' }}>
          {["Conditions d'utilisation",'Confidentialité','Cookies'].map(l => <a key={l} href="#" style={{ color:'rgba(255,255,255,0.3)', fontSize:'0.82rem', textDecoration:'none' }}>{l}</a>)}
        </div>
        <div style={{ color:'rgba(255,255,255,0.4)', fontSize:'0.82rem' }}>🌍 Français</div>
      </div>
    </footer>
  )
}