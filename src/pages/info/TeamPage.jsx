import Header from '../../components/layout/Header'
import Footer from '../../components/layout/Footer'
import { useState } from 'react'

function Avatar({ photo, name, color }) {
  const [erreur, setErreur] = useState(false)
  const initiales = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)

  if (erreur || !photo) {
    return (
      <div style={{
        width: 90, height: 90, borderRadius: '50%', background: color,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontWeight: 800, fontSize: '1.8rem', color: 'white',
        margin: '0 auto 1.2rem', fontFamily: 'system-ui,sans-serif',
        border: `3px solid ${color}`, boxShadow: `0 0 0 4px ${color}22`
      }}>
        {initiales}
      </div>
    )
  }

  return (
    <img
      src={photo}
      alt={name}
      onError={() => setErreur(true)}
      style={{
        width: 90, height: 90, borderRadius: '50%', objectFit: 'cover',
        margin: '0 auto 1.2rem', display: 'block',
        border: `3px solid ${color}`, boxShadow: `0 0 0 4px ${color}22`
      }}
    />
  )
}

export default function TeamPage() {
  const members = [
    {
      photo: '/public/boubacar.jpg',
      name: 'Ba Boubacar',
      role: 'Étudiant L3 Informatique',
      desc: 'Curieux et rigoureux, il s\'est investi dans la réalisation de CovoLiv avec l\'objectif de proposer une solution numérique utile et adaptée au contexte marocain.',
      color: '#1565C0',
    },
    {
      photo: '/public/mamadou.jpg',
      name: 'Baldé Mamadou Hady',
      role: 'Étudiant L3 Informatique',
      desc: 'Passionné de développement web et de nouvelles technologies, il a contribué à la conception et au développement de la plateforme CovoLiv dans le cadre de son projet de fin d\'études.',
      color: '#00875A',
    },
  ]

  return (
    <>
      <Header />
      <div style={{ marginTop:108, background:'#F9FAFB', minHeight:'100vh' }}>

        <div style={{ background:'#111827', padding:'4rem 2rem' }}>
          <div style={{ maxWidth:800, margin:'0 auto', textAlign:'center' }}>
            <div style={{ display:'inline-flex', alignItems:'center', gap:'0.4rem', background:'rgba(0,135,90,0.2)', color:'#6EE7B7', padding:'0.3rem 1rem', borderRadius:50, fontSize:'0.78rem', fontWeight:600, marginBottom:'1.2rem', fontFamily:'system-ui,sans-serif' }}>
              L3 Informatique — FST Béni Mellal
            </div>
            <h1 style={{ fontWeight:800, fontSize:'2.4rem', color:'white', fontFamily:'system-ui,sans-serif', letterSpacing:'-0.5px', marginBottom:'1rem' }}>
              Notre équipe
            </h1>
            <p style={{ color:'rgba(255,255,255,0.55)', fontSize:'1rem', lineHeight:1.8, fontFamily:'system-ui,sans-serif' }}>
              CovoLiv a été conçu et développé par deux étudiants passionnés de la FST de Béni Mellal.
            </p>
          </div>
        </div>

        <div style={{ maxWidth:800, margin:'0 auto', padding:'3rem 2rem' }}>

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1.5rem', marginBottom:'3rem' }}>
            {members.map(m => (
              <div key={m.name} style={{ background:'white', borderRadius:16, padding:'2rem', border:'1px solid #E5E7EB', textAlign:'center', boxShadow:'0 2px 8px rgba(0,0,0,0.04)' }}>
                <Avatar photo={m.photo} name={m.name} color={m.color} />
                <div style={{ fontWeight:700, fontSize:'1.1rem', color:'#111827', fontFamily:'system-ui,sans-serif', marginBottom:'0.3rem' }}>{m.name}</div>
                <div style={{ display:'inline-block', background:'#E8F5F0', color:'#00875A', padding:'0.2rem 0.8rem', borderRadius:50, fontSize:'0.75rem', fontWeight:600, marginBottom:'0.9rem', fontFamily:'system-ui,sans-serif' }}>
                  {m.role}
                </div>
                <p style={{ color:'#6B7280', fontSize:'0.85rem', lineHeight:1.7, fontFamily:'system-ui,sans-serif' }}>{m.desc}</p>
              </div>
            ))}
          </div>

          <div style={{ background:'white', borderRadius:16, padding:'2rem', border:'1px solid #E5E7EB', marginBottom:'2rem', display:'flex', alignItems:'center', gap:'1.5rem', flexWrap:'wrap' }}>
            <div style={{ width:72, height:72, borderRadius:'50%', background:'#4A148C', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:800, fontSize:'1.4rem', color:'white', fontFamily:'system-ui,sans-serif', flexShrink:0, boxShadow:'0 0 0 4px rgba(74,20,140,0.13)' }}>
              KZ
            </div>
            <div>
              <div style={{ fontSize:'0.72rem', color:'#9CA3AF', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.5px', marginBottom:'0.3rem', fontFamily:'system-ui,sans-serif' }}>
                Encadrant académique
              </div>
              <div style={{ fontWeight:700, fontSize:'1.1rem', color:'#111827', fontFamily:'system-ui,sans-serif', marginBottom:'0.2rem' }}>
                M. Khoudi Zakaria
              </div>
              <div style={{ color:'#6B7280', fontSize:'0.85rem', fontFamily:'system-ui,sans-serif' }}>
                Enseignant-chercheur — FST Béni Mellal
              </div>
              <div style={{ color:'#9CA3AF', fontSize:'0.8rem', fontFamily:'system-ui,sans-serif', marginTop:'0.2rem' }}>
                Université Sultan Moulay Slimane
              </div>
            </div>
          </div>

          <div style={{ background:'#111827', borderRadius:16, padding:'1.5rem', textAlign:'center' }}>
            <div style={{ color:'rgba(255,255,255,0.5)', fontSize:'0.82rem', fontFamily:'system-ui,sans-serif', marginBottom:'0.3rem' }}>Projet de Fin d'Études</div>
            <div style={{ fontWeight:700, fontSize:'1rem', color:'white', fontFamily:'system-ui,sans-serif' }}>
              Licence 3 Informatique — FST Béni Mellal — 2025/2026
            </div>
          </div>

        </div>
      </div>
      <Footer />
    </>
  )
}