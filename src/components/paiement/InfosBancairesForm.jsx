import { useState, useEffect } from 'react'

const BANQUES = [
  'Attijariwafa Bank', 'Banque Populaire', 'BMCE Bank (Bank of Africa)',
  'CIH Bank', 'Crédit Agricole du Maroc', 'BMCI', 'Société Générale Maroc',
  'Crédit du Maroc', 'CFG Bank', 'Al Barid Bank', 'Arab Bank Maroc'
]

const API = 'http://localhost:8080'

const labelStyle = {
  fontSize:'0.72rem', fontWeight:600, color:'#374151',
  textTransform:'uppercase', letterSpacing:'0.4px',
  display:'block', marginBottom:'0.35rem', fontFamily:'system-ui'
}
const inputStyle = {
  width:'100%', padding:'0.7rem 0.9rem', border:'1px solid #D1D5DB',
  borderRadius:8, fontSize:'0.85rem', outline:'none',
  fontFamily:'system-ui', color:'#111827', background:'white',
  boxSizing:'border-box'
}

export default function InfosBancairesForm({ conducteurId, authHeader }) {
  const [form, setForm] = useState({
    nomComplet:'', banque:'', rib:'', iban:'', telephone:'', cmiMerchantId:''
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (!conducteurId) return
    fetch(`${API}/api/paiements/infos-bancaires/${conducteurId}`, {
      headers: authHeader()
    })
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        if (d) setForm({
          nomComplet: d.nomComplet || '',
          banque: d.banque || '',
          rib: d.rib || '',
          iban: d.iban || '',
          telephone: d.telephone || '',
          cmiMerchantId: d.cmiMerchantId || ''
        })
      })
      .catch(() => {})
  }, [conducteurId])

  const handleSave = async () => {
    if (!form.nomComplet.trim()) { setError('Le nom complet est obligatoire'); return }
    if (!form.banque) { setError('Sélectionnez votre banque'); return }
    if (!form.rib.trim() && !form.iban.trim() && !form.telephone.trim()) {
      setError('Entrez au moins un RIB, IBAN ou téléphone'); return
    }
    setLoading(true); setError('')
    try {
      const res = await fetch(`${API}/api/paiements/infos-bancaires`, {
        method: 'POST',
        headers: authHeader(),
        body: JSON.stringify(form)
      })
      if (!res.ok) throw new Error()
      setSuccess(' Coordonnées bancaires enregistrées !')
      setTimeout(() => setSuccess(''), 4000)
    } catch (e) {
      setError('Erreur lors de la sauvegarde')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      {success && (
        <div style={{ background:'#E8F5F0', color:'#00875A', padding:'0.6rem 0.9rem', borderRadius:8, marginBottom:'1rem', fontSize:'0.82rem', fontFamily:'system-ui', border:'1px solid #A7F3D0' }}>
          {success}
        </div>
      )}
      {error && (
        <div style={{ background:'#FEF2F2', color:'#7F1D1D', padding:'0.6rem 0.9rem', borderRadius:8, marginBottom:'1rem', fontSize:'0.82rem', fontFamily:'system-ui', border:'1px solid #FECACA' }}>
          {error}
        </div>
      )}

      <div style={{ background:'#DBEAFE', border:'1px solid #BFDBFE', borderRadius:8, padding:'0.7rem 1rem', marginBottom:'1.2rem', fontSize:'0.78rem', color:'#1E3A8A', fontFamily:'system-ui' }}>
         Ces coordonnées seront affichées aux clients qui veulent vous payer par virement. Vérifiez-les soigneusement avant de sauvegarder.
      </div>

      <div style={{ display:'grid', gap:'0.9rem' }}>
        <div>
          <label style={labelStyle}>Nom complet (tel que sur votre RIB) *</label>
          <input type="text" placeholder="Prénom Nom"
            value={form.nomComplet}
            onChange={e => setForm({...form, nomComplet: e.target.value})}
            style={inputStyle} />
        </div>

        <div>
          <label style={labelStyle}>Banque *</label>
          <select value={form.banque}
            onChange={e => setForm({...form, banque: e.target.value})}
            style={{ ...inputStyle, background:'white' }}>
            <option value="">Sélectionnez votre banque</option>
            {BANQUES.map(b => <option key={b} value={b}>{b}</option>)}
          </select>
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.9rem' }}>
          <div>
            <label style={labelStyle}>RIB (24 chiffres)</label>
            <input type="text"
              placeholder="230 810 0123456789012345 67"
              value={form.rib}
              onChange={e => setForm({...form, rib: e.target.value})}
              style={{ ...inputStyle, fontFamily:'monospace' }}
              maxLength={28} />
          </div>
          <div>
            <label style={labelStyle}>IBAN (optionnel)</label>
            <input type="text"
              placeholder="MA64 XXXX XXXX XXXX"
              value={form.iban}
              onChange={e => setForm({...form, iban: e.target.value})}
              style={{ ...inputStyle, fontFamily:'monospace' }} />
          </div>
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.9rem' }}>
          <div>
            <label style={labelStyle}>Téléphone (CashPlus / Wafacash)</label>
            <input type="tel"
              placeholder="06 XX XX XX XX"
              value={form.telephone}
              onChange={e => setForm({...form, telephone: e.target.value})}
              style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>ID Marchand CMI (optionnel)</label>
            <input type="text"
              placeholder="CMI-XXXXXXX"
              value={form.cmiMerchantId}
              onChange={e => setForm({...form, cmiMerchantId: e.target.value})}
              style={{ ...inputStyle, fontFamily:'monospace' }} />
          </div>
        </div>
      </div>

      <button onClick={handleSave} disabled={loading}
        style={{
          display:'inline-flex', alignItems:'center', gap:'0.4rem',
          padding:'0.75rem 1.4rem',
          background: loading ? '#9CA3AF' : '#1D4ED8',
          color:'white', border:'none', borderRadius:8,
          fontWeight:600, fontSize:'0.85rem',
          cursor: loading ? 'not-allowed' : 'pointer',
          fontFamily:'system-ui', marginTop:'1.2rem',
          transition:'all 0.2s', boxShadow:'0 2px 6px rgba(29,78,216,0.25)'
        }}
        onMouseEnter={e => { if (!loading) { e.currentTarget.style.background='#1e40af'; e.currentTarget.style.transform='translateY(-1px)' }}}
        onMouseLeave={e => { e.currentTarget.style.background = loading ? '#9CA3AF' : '#1D4ED8'; e.currentTarget.style.transform='translateY(0)' }}>
        {loading ? 'Sauvegarde...' : '💾 Sauvegarder mes coordonnées'}
      </button>
    </div>
  )
}