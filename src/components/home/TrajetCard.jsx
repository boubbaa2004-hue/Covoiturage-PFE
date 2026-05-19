export default function TrajetCard({ from, to, date, time, seats, driver, price, image, marque }) {
  return (
    <div style={{ background:'white', borderRadius:12, border:'1px solid #EBEBEB', overflow:'hidden', transition:'box-shadow 0.2s', display:'flex', alignItems:'stretch' }}
      onMouseEnter={e => e.currentTarget.style.boxShadow='0 2px 12px rgba(0,0,0,0.08)'}
      onMouseLeave={e => e.currentTarget.style.boxShadow='none'}>

      {/* Gauche — Photo profil grande */}
      <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'1rem 1.2rem', minWidth:120, gap:'0.4rem' }}>
        <div style={{ position:'relative' }}>
          <div style={{ width:72, height:72, borderRadius:'50%', overflow:'hidden', border:'2px solid #f0f0f0' }}>
            {driver.photo ? (
              <img src={driver.photo} alt={driver.name}
                style={{ width:'100%', height:'100%', objectFit:'cover' }}
                onError={e => {
                  e.target.style.display='none'
                  e.target.parentElement.innerHTML=`<div style="width:100%;height:100%;background:#222;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:1.2rem;color:white;font-family:sans-serif">${driver.initials}</div>`
                }}
              />
            ) : (
              <div style={{ width:'100%', height:'100%', background:'#222', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, fontSize:'1.2rem', color:'white', fontFamily:'sans-serif' }}>
                {driver.initials}
              </div>
            )}
          </div>
          {/* Badge vérifié */}
          <div style={{ position:'absolute', bottom:1, right:1, width:18, height:18, background:'#1D9BF0', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', border:'2px solid white', fontSize:'0.55rem', color:'white', fontWeight:700 }}>✓</div>
        </div>
        <div style={{ fontWeight:600, fontSize:'0.82rem', color:'#111', textAlign:'center', fontFamily:'system-ui,sans-serif' }}>{driver.name}</div>
        <div style={{ fontSize:'0.75rem', color:'#555', fontFamily:'system-ui,sans-serif', display:'flex', alignItems:'center', gap:'0.3rem' }}>
          <span style={{ color:'#F59E0B' }}>★</span>
          <span>{parseFloat(driver.rating) > 0 ? `${parseFloat(driver.rating).toFixed(1)}` : 'Nouveau'}</span>
        </div>
      </div>

      {/* Milieu — Infos trajet */}
      <div style={{ flex:1, padding:'1.2rem 2rem', display:'flex', flexDirection:'column', justifyContent:'center', gap:'0.35rem', borderLeft:'1px solid #F0F0F0' }}>

        {/* Titre */}
        <div style={{ fontWeight:700, fontSize:'1rem', color:'#111', fontFamily:'system-ui,sans-serif' }}>
          {from} → {to}
        </div>

        {/* Date */}
        <div style={{ fontSize:'0.82rem', color:'#555', fontFamily:'system-ui,sans-serif' }}>
          Départ le &nbsp;
          <span style={{ color:'#111', fontWeight:500 }}>{date}</span>
          &nbsp;à&nbsp;
          <span style={{ color:'#111', fontWeight:500 }}>{time}</span>
        </div>

        {/* Départ / Arrivée */}
        <div style={{ display:'grid', gridTemplateColumns:'60px 1fr', gap:'0.1rem 0.5rem', marginTop:'0.1rem' }}>
          <span style={{ fontSize:'0.78rem', color:'#888', fontFamily:'system-ui,sans-serif' }}>Départ :</span>
          <span style={{ fontSize:'0.78rem', color:'#444', fontFamily:'system-ui,sans-serif' }}>{from}</span>
          <span style={{ fontSize:'0.78rem', color:'#888', fontFamily:'system-ui,sans-serif' }}>Arrivée :</span>
          <span style={{ fontSize:'0.78rem', color:'#444', fontFamily:'system-ui,sans-serif' }}>{to}</span>
        </div>

        {/* Places */}
        <div style={{ fontSize:'0.75rem', color:'#888', fontFamily:'system-ui,sans-serif', marginTop:'0.1rem' }}>
          {seats} place(s) disponible(s)
        </div>
      </div>

      {/* Photo voiture */}
      <div style={{ width:155, position:'relative', overflow:'hidden', borderLeft:'1px solid #F0F0F0', flexShrink:0 }}>
        <img src={image} alt="Voiture"
          style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }}
          onError={e => e.target.src='https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=500&q=80&fit=crop'}
        />
        {marque && (
          <div style={{ position:'absolute', bottom:0, left:0, right:0, background:'rgba(0,0,0,0.55)', padding:'0.3rem', textAlign:'center' }}>
            <span style={{ color:'white', fontSize:'0.7rem', fontWeight:600, fontFamily:'system-ui,sans-serif' }}>
              🚗 {marque}
            </span>
          </div>
        )}
      </div>

      {/* Prix */}
      <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', justifyContent:'center', padding:'1rem 1.5rem', borderLeft:'1px solid #F0F0F0', minWidth:100, flexShrink:0 }}>
        <div style={{ fontWeight:700, fontSize:'1.3rem', color:'#111', whiteSpace:'nowrap', fontFamily:'system-ui,sans-serif' }}>
          {price} MAD
        </div>
        <div style={{ fontSize:'0.72rem', color:'#888', fontFamily:'system-ui,sans-serif', marginTop:2 }}>
          {seats} place{seats > 1 ? 's' : ''}
        </div>
      </div>

    </div>
  )
}