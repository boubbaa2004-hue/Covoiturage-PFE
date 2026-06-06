import Header from '../../components/layout/Header'
import Footer from '../../components/layout/Footer'
import { useState } from 'react'

const inputStyle = { width:'100%', padding:'0.75rem 0.9rem', border:'1px solid #D1D5DB', borderRadius:8, fontSize:'0.88rem', outline:'none', fontFamily:'system-ui,sans-serif', color:'#111827', background:'white', boxSizing:'border-box' }
const labelStyle = { fontSize:'0.72rem', fontWeight:600, color:'#374151', textTransform:'uppercase', letterSpacing:'0.4px', display:'block', marginBottom:'0.35rem', fontFamily:'system-ui,sans-serif' }

const types = ['Bug technique', 'Problème de paiement', 'Conducteur inapproprié', 'Colis non livré', 'Compte bloqué', 'Autre']

export default function SignalerPage() {
  const [form, setForm] = useState({ type:'', description:'', email:'', urgent:false })
  const [sent, setSent] = useState(false)

  const handleSubmit = () => {
    if (!form.type || !form.description) return
    setSent(true)
  }

  return (
    <>
      <Header />
      <div style={{ marginTop:108, background:'#F9FAFB', minHeight:'100vh' }}>

        <div style={{ background:'#111827', padding:'4rem 2rem' }}>
          <div style={{ maxWidth:800, margin:'0 auto', textAlign:'center' }}>
            <h1 style={{ fontWeight:800, fontSize:'2.4rem', color:'white', fontFamily:'system-ui,sans-serif', letterSpacing:'-0.5px', marginBottom:'1rem' }}>
              Signaler un problème
            </h1>
            <p style={{ color:'rgba(255,255,255,0.55)', fontSize:'1rem', lineHeight:1.8, fontFamily:'system-ui,sans-serif' }}>
              Aidez-nous à améliorer CovoLiv en nous signalant tout problème rencontré.
            </p>
          </div>
        </div>

        <div style={{ maxWidth:620, margin:'0 auto', padding:'3rem 2rem' }}>
          <div style={{ background:'white', borderRadius:16, padding:'2rem', border:'1px solid #E5E7EB' }}>
            {sent ? (
              <div style={{ textAlign:'center', padding:'2rem 0' }}>
                <div style={{ width:56, height:56, borderRadius:'50%', background:'#E8F5F0', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 1rem', fontSize:'1.5rem' }}>✓</div>
                <div style={{ fontWeight:700, fontSize:'1.1rem', color:'#111827', marginBottom:'0.4rem', fontFamily:'system-ui,sans-serif' }}>Signalement envoyé</div>
                <p style={{ color:'#6B7280', fontSize:'0.85rem', fontFamily:'system-ui,sans-serif', marginBottom:'1.2rem' }}>Notre équipe va examiner votre signalement et prendre les mesures nécessaires.</p>
                <button onClick={() => { setSent(false); setForm({ type:'', description:'', email:'', urgent:false }) }}
                  style={{ background:'#00875A', color:'white', border:'none', borderRadius:8, padding:'0.6rem 1.4rem', fontWeight:600, fontSize:'0.85rem', cursor:'pointer', fontFamily:'system-ui,sans-serif' }}>
                  Nouveau signalement
                </button>
              </div>
            ) : (
              <div>
                <div style={{ background:'#FEF2F2', border:'1px solid #FECACA', borderRadius:8, padding:'0.8rem 1rem', marginBottom:'1.5rem', fontSize:'0.82rem', color:'#7F1D1D', fontFamily:'system-ui,sans-serif' }}>
                  Pour les urgences, contactez-nous directement à <strong>covoliv.pfe@gmail.com</strong>
                </div>

                <div style={{ marginBottom:'1rem' }}>
                  <label style={labelStyle}>Type de problème *</label>
                  <select value={form.type} onChange={e => setForm({...form, type:e.target.value})} style={{ ...inputStyle, background:'white' }}>
                    <option value="">Sélectionner...</option>
                    {types.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>

                <div style={{ marginBottom:'1rem' }}>
                  <label style={labelStyle}>Description détaillée *</label>
                  <textarea placeholder="Décrivez le problème en détail..." value={form.description} onChange={e => setForm({...form, description:e.target.value})} rows={5} style={{ ...inputStyle, resize:'vertical' }} />
                </div>

                <div style={{ marginBottom:'1.2rem' }}>
                  <label style={labelStyle}>Votre email (pour suivi)</label>
                  <input type="email" placeholder="votre@email.com" value={form.email} onChange={e => setForm({...form, email:e.target.value})} style={inputStyle} />
                </div>

                <div style={{ display:'flex', alignItems:'center', gap:'0.6rem', marginBottom:'1.5rem', cursor:'pointer' }} onClick={() => setForm({...form, urgent:!form.urgent})}>
                  <div style={{ width:18, height:18, borderRadius:4, border:`2px solid ${form.urgent ? '#C2410C' : '#D1D5DB'}`, background: form.urgent ? '#C2410C' : 'white', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                    {form.urgent && <span style={{ color:'white', fontSize:'0.7rem', fontWeight:700 }}>✓</span>}
                  </div>
                  <span style={{ fontSize:'0.85rem', color:'#374151', fontFamily:'system-ui,sans-serif' }}>Marquer comme urgent</span>
                </div>

                <button onClick={handleSubmit}
                  style={{ width:'100%', padding:'0.85rem', background:'#7F1D1D', color:'white', border:'none', borderRadius:8, fontWeight:600, fontSize:'0.9rem', cursor:'pointer', fontFamily:'system-ui,sans-serif' }}>
                  Envoyer le signalement
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