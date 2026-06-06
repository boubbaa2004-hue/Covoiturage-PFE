import Header from '../../components/layout/Header'
import Footer from '../../components/layout/Footer'
import { useState } from 'react'

const inputStyle = { width:'100%', padding:'0.75rem 0.9rem', border:'1px solid #D1D5DB', borderRadius:8, fontSize:'0.88rem', outline:'none', fontFamily:'system-ui,sans-serif', color:'#111827', background:'white', boxSizing:'border-box' }
const labelStyle = { fontSize:'0.72rem', fontWeight:600, color:'#374151', textTransform:'uppercase', letterSpacing:'0.4px', display:'block', marginBottom:'0.35rem', fontFamily:'system-ui,sans-serif' }

export default function ContactPage() {
  const [form, setForm] = useState({ nom:'', email:'', sujet:'', message:'' })
  const [sent, setSent] = useState(false)

  const handleSubmit = () => {
    if (!form.nom || !form.email || !form.message) return
    setSent(true)
  }

  return (
    <>
      <Header />
      <div style={{ marginTop:108, background:'#F9FAFB', minHeight:'100vh' }}>

        <div style={{ background:'#111827', padding:'4rem 2rem' }}>
          <div style={{ maxWidth:800, margin:'0 auto', textAlign:'center' }}>
            <h1 style={{ fontWeight:800, fontSize:'2.4rem', color:'white', fontFamily:'system-ui,sans-serif', letterSpacing:'-0.5px', marginBottom:'1rem' }}>
              Contactez-nous
            </h1>
            <p style={{ color:'rgba(255,255,255,0.55)', fontSize:'1rem', lineHeight:1.8, fontFamily:'system-ui,sans-serif' }}>
              Une question sur CovoLiv ? Nous vous répondrons dans les plus brefs délais.
            </p>
          </div>
        </div>

        <div style={{ maxWidth:700, margin:'0 auto', padding:'3rem 2rem' }}>

          {/* Infos contact */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'1rem', marginBottom:'2.5rem' }}>
            {[
              ['📧', 'Email', 'covoliv.pfe@gmail.com'],
              ['📍', 'Adresse', 'FST Béni Mellal, Maroc'],
              ['🏛️', 'Université', 'USMS Béni Mellal'],
            ].map(([icon, label, val]) => (
              <div key={label} style={{ background:'white', borderRadius:12, padding:'1.2rem', border:'1px solid #E5E7EB', textAlign:'center' }}>
                <div style={{ fontSize:'1.4rem', marginBottom:'0.4rem' }}>{icon}</div>
                <div style={{ fontSize:'0.72rem', color:'#9CA3AF', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.4px', marginBottom:'0.3rem', fontFamily:'system-ui,sans-serif' }}>{label}</div>
                <div style={{ fontSize:'0.82rem', color:'#374151', fontWeight:600, fontFamily:'system-ui,sans-serif' }}>{val}</div>
              </div>
            ))}
          </div>

          {/* Formulaire */}
          <div style={{ background:'white', borderRadius:16, padding:'2rem', border:'1px solid #E5E7EB' }}>
            {sent ? (
              <div style={{ textAlign:'center', padding:'2rem 0' }}>
                <div style={{ width:56, height:56, borderRadius:'50%', background:'#E8F5F0', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 1rem', fontSize:'1.5rem' }}>✓</div>
                <div style={{ fontWeight:700, fontSize:'1.1rem', color:'#111827', marginBottom:'0.4rem', fontFamily:'system-ui,sans-serif' }}>Message envoyé !</div>
                <p style={{ color:'#6B7280', fontSize:'0.85rem', fontFamily:'system-ui,sans-serif' }}>Nous vous répondrons dans les plus brefs délais.</p>
                <button onClick={() => { setSent(false); setForm({ nom:'', email:'', sujet:'', message:'' }) }}
                  style={{ marginTop:'1rem', background:'#00875A', color:'white', border:'none', borderRadius:8, padding:'0.6rem 1.4rem', fontWeight:600, fontSize:'0.85rem', cursor:'pointer', fontFamily:'system-ui,sans-serif' }}>
                  Nouveau message
                </button>
              </div>
            ) : (
              <div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem', marginBottom:'1rem' }}>
                  <div>
                    <label style={labelStyle}>Nom complet *</label>
                    <input type="text" placeholder="Votre nom" value={form.nom} onChange={e => setForm({...form, nom:e.target.value})} style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Email *</label>
                    <input type="email" placeholder="votre@email.com" value={form.email} onChange={e => setForm({...form, email:e.target.value})} style={inputStyle} />
                  </div>
                </div>
                <div style={{ marginBottom:'1rem' }}>
                  <label style={labelStyle}>Sujet</label>
                  <input type="text" placeholder="Objet de votre message" value={form.sujet} onChange={e => setForm({...form, sujet:e.target.value})} style={inputStyle} />
                </div>
                <div style={{ marginBottom:'1.2rem' }}>
                  <label style={labelStyle}>Message *</label>
                  <textarea placeholder="Votre message..." value={form.message} onChange={e => setForm({...form, message:e.target.value})} rows={5} style={{ ...inputStyle, resize:'vertical' }} />
                </div>
                <button onClick={handleSubmit}
                  style={{ width:'100%', padding:'0.85rem', background:'#00875A', color:'white', border:'none', borderRadius:8, fontWeight:600, fontSize:'0.9rem', cursor:'pointer', fontFamily:'system-ui,sans-serif' }}>
                  Envoyer le message
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}