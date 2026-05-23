import { useState, useEffect } from 'react'
import { getToken } from '../../lib/api'

const API = 'http://localhost:8080'

const BANQUES_MAROC = [
  'Attijariwafa Bank', 'Banque Populaire', 'BMCE Bank (Bank of Africa)',
  'CIH Bank', 'Crédit Agricole du Maroc', 'BMCI', 'Société Générale Maroc',
  'Crédit du Maroc', 'CFG Bank', 'Al Barid Bank', 'Arab Bank Maroc'
]

const STATUT_CONFIG = {
  EN_ATTENTE_PAIEMENT: { label: 'En attente de paiement', color: '#713F12', bg: '#FEF9C3', icon: '⏳' },
  PAIEMENT_ENVOYE:     { label: 'Paiement envoyé — En attente de validation', color: '#1E3A8A', bg: '#DBEAFE', icon: '📤' },
  CONFIRME:            { label: 'Paiement confirmé par le conducteur', color: '#00875A', bg: '#E8F5F0', icon: '✅' },
  CONTESTE:            { label: 'Paiement contesté par le conducteur', color: '#7F1D1D', bg: '#FEE2E2', icon: '⚠️' },
}

export default function ModalPaiement({
  type, colisId, reservationId, beneficiaireId, nomBeneficiaire,
  montant, onClose, onSuccess
}) {
  const [etape, setEtape] = useState(1)
  const [methode, setMethode] = useState('')
  const [momentPaiement, setMomentPaiement] = useState('IMMEDIAT')
  const [paiement, setPaiement] = useState(null)
  const [infosBancaires, setInfosBancaires] = useState(null)
  const [reference, setReference] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const authHeader = () => ({
    'Authorization': `Bearer ${getToken()}`,
    'Content-Type': 'application/json'
  })

  // Charger infos bancaires du conducteur
  useEffect(() => {
    if (beneficiaireId) {
      fetch(`${API}/api/paiements/infos-bancaires/${beneficiaireId}`, {
        headers: authHeader()
      }).then(r => r.ok ? r.json() : null)
        .then(d => setInfosBancaires(d))
        .catch(() => {})
    }
  }, [beneficiaireId])

  // Vérifier si paiement déjà existant
  useEffect(() => {
    const url = colisId
      ? `${API}/api/paiements/colis/${colisId}`
      : `${API}/api/paiements/reservation/${reservationId}`
    fetch(url, { headers: authHeader() })
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        if (d && d.statut !== 'ANNULE') {
          setPaiement(d)
          setMethode(d.methode)
          setEtape(d.statut === 'CONFIRME' ? 4 : d.statut === 'PAIEMENT_ENVOYE' ? 3 : 2)
        }
      })
      .catch(() => {})
  }, [])

  const handleInitier = async () => {
    if (!methode) { setError('Choisissez une méthode'); return }
    if ((methode === 'VIREMENT' || methode === 'CMI') && !infosBancaires) {
      setError('Le conducteur n\'a pas encore renseigné ses coordonnées bancaires'); return
    }
    setLoading(true); setError('')
    try {
      const res = await fetch(`${API}/api/paiements`, {
        method: 'POST', headers: authHeader(),
        body: JSON.stringify({
          methode, type, momentPaiement,
          colisId: colisId || null,
          reservationId: reservationId || null,
          beneficiaireId
        })
      })
      if (!res.ok) throw new Error(await res.text())
      const data = await res.json()
      setPaiement(data)
      setEtape(2)
    } catch (e) { setError(e.message || 'Erreur') }
    finally { setLoading(false) }
  }

  const handleDeclarer = async () => {
    if ((methode === 'VIREMENT' || methode === 'CMI') && !reference.trim()) {
      setError('Entrez la référence de transaction'); return
    }
    setLoading(true); setError('')
    try {
      const res = await fetch(`${API}/api/paiements/${paiement.id}/declarer`, {
        method: 'PATCH', headers: authHeader(),
        body: JSON.stringify({ referenceClient: reference })
      })
      if (!res.ok) throw new Error()
      const data = await res.json()
      setPaiement(data)
      setEtape(3)
    } catch (e) { setError('Erreur lors de la déclaration') }
    finally { setLoading(false) }
  }

  const statutConf = paiement ? STATUT_CONFIG[paiement.statut] : null

  return (
    <div style={{
      position:'fixed', inset:0, background:'rgba(0,0,0,0.65)',
      zIndex:3000, display:'flex', alignItems:'center', justifyContent:'center',
      padding:'1rem', backdropFilter:'blur(6px)'
    }}>
      <div style={{
        background:'white', borderRadius:18, width:'100%', maxWidth:520,
        boxShadow:'0 32px 100px rgba(0,0,0,0.35)', overflow:'hidden',
        maxHeight:'90vh', overflowY:'auto'
      }}>

        {/* Header */}
        <div style={{
          background: paiement?.statut === 'CONFIRME'
            ? 'linear-gradient(135deg,#00875A,#005C3E)'
            : paiement?.statut === 'CONTESTE'
              ? 'linear-gradient(135deg,#7F1D1D,#991B1B)'
              : '#111827',
          padding:'1.5rem 1.8rem'
        }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
            <div>
              <div style={{ fontSize:'0.7rem', color:'rgba(255,255,255,0.55)', fontFamily:'system-ui', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.6px', marginBottom:6 }}>
                {type === 'COVOITURAGE' ? '🚗 Paiement covoiturage' : '📦 Paiement livraison'}
              </div>
              <div style={{ fontWeight:700, fontSize:'1.15rem', color:'white', fontFamily:'system-ui' }}>
                Paiement à {nomBeneficiaire}
              </div>
              {paiement && (
                <div style={{ marginTop:6, display:'inline-flex', alignItems:'center', gap:'0.4rem', background:'rgba(255,255,255,0.12)', color:'white', padding:'0.2rem 0.7rem', borderRadius:50, fontSize:'0.72rem', fontFamily:'system-ui', fontWeight:500 }}>
                  {statutConf?.icon} {statutConf?.label}
                </div>
              )}
            </div>
            <div style={{ textAlign:'right' }}>
              <div style={{ fontSize:'0.65rem', color:'rgba(255,255,255,0.55)', fontFamily:'system-ui', marginBottom:2 }}>Montant</div>
              <div style={{ fontWeight:800, fontSize:'1.8rem', color:'#FCD34D', fontFamily:'system-ui', lineHeight:1 }}>
                {montant}
              </div>
              <div style={{ fontSize:'0.75rem', color:'rgba(255,255,255,0.6)', fontFamily:'system-ui' }}>MAD</div>
            </div>
          </div>

          {/* Steps */}
          <div style={{ display:'flex', alignItems:'center', gap:'0.4rem', marginTop:'1.2rem' }}>
            {['Méthode', 'Coordonnées', 'Confirmation', 'Validé'].map((s, i) => (
              <div key={s} style={{ display:'flex', alignItems:'center', flex: i < 3 ? 1 : 'none' }}>
                <div style={{
                  width:24, height:24, borderRadius:'50%',
                  background: etape > i+1 ? '#00875A' : etape === i+1 ? 'white' : 'rgba(255,255,255,0.2)',
                  color: etape > i+1 ? 'white' : etape === i+1 ? '#111827' : 'rgba(255,255,255,0.4)',
                  display:'flex', alignItems:'center', justifyContent:'center',
                  fontSize:'0.7rem', fontWeight:700, fontFamily:'system-ui', flexShrink:0
                }}>
                  {etape > i+1 ? '✓' : i+1}
                </div>
                <div style={{ fontSize:'0.65rem', color: etape >= i+1 ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.35)', fontFamily:'system-ui', marginLeft:'0.3rem', whiteSpace:'nowrap' }}>
                  {s}
                </div>
                {i < 3 && <div style={{ flex:1, height:1, background: etape > i+1 ? '#00875A' : 'rgba(255,255,255,0.15)', margin:'0 0.5rem' }} />}
              </div>
            ))}
          </div>
        </div>

        <div style={{ padding:'1.5rem 1.8rem' }}>

          {error && (
            <div style={{ background:'#FEF2F2', color:'#7F1D1D', padding:'0.75rem 1rem', borderRadius:8, fontSize:'0.82rem', marginBottom:'1.2rem', fontFamily:'system-ui', border:'1px solid #FECACA', display:'flex', alignItems:'center', gap:'0.5rem' }}>
              ⚠️ {error}
            </div>
          )}

          {/* ÉTAPE 1 — Choisir méthode + moment */}
          {etape === 1 && (
            <>
              <div style={{ fontSize:'0.75rem', fontWeight:700, color:'#374151', fontFamily:'system-ui', textTransform:'uppercase', letterSpacing:'0.5px', marginBottom:'0.8rem' }}>
                Méthode de paiement
              </div>

              {[
                { id:'ESPECES', label:'Espèces', icon:'💵', desc: type === 'COVOITURAGE' ? 'Remise en main propre au conducteur lors de la montée' : 'Remise en main propre lors de l\'enlèvement ou livraison', color:'#00875A', bg:'#E8F5F0' },
                { id:'VIREMENT', label:'Virement bancaire', icon:'🏦', desc: infosBancaires ? `${infosBancaires.banque} — RIB disponible` : 'Coordonnées bancaires du conducteur', color:'#1D4ED8', bg:'#EFF6FF', disabled: !infosBancaires },
                { id:'CMI', label:'Carte bancaire (CMI)', icon:'💳', desc: infosBancaires?.cmiMerchantId ? `Marchand CMI : ${infosBancaires.cmiMerchantId}` : 'Visa · Mastercard · Cartes marocaines', color:'#7C3AED', bg:'#F5F3FF', disabled: !infosBancaires?.cmiMerchantId }
              ].map(m => (
                <div key={m.id}
                  onClick={() => !m.disabled && setMethode(m.id)}
                  style={{
                    border: methode === m.id ? `2px solid ${m.color}` : '1.5px solid #E5E7EB',
                    borderRadius:10, padding:'0.9rem 1.1rem', cursor: m.disabled ? 'not-allowed' : 'pointer',
                    background: m.disabled ? '#F9FAFB' : methode === m.id ? m.bg : 'white',
                    display:'flex', alignItems:'center', gap:'1rem', marginBottom:'0.6rem',
                    opacity: m.disabled ? 0.5 : 1, transition:'all 0.15s'
                  }}>
                  <div style={{ width:42, height:42, borderRadius:10, background: methode === m.id ? m.bg : '#F9FAFB', border:`1.5px solid ${methode === m.id ? m.color : '#E5E7EB'}`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.2rem', flexShrink:0 }}>
                    {m.icon}
                  </div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontWeight:600, fontSize:'0.88rem', color: methode === m.id ? m.color : m.disabled ? '#9CA3AF' : '#111827', fontFamily:'system-ui' }}>{m.label}</div>
                    <div style={{ fontSize:'0.73rem', color:'#6B7280', fontFamily:'system-ui', marginTop:2 }}>{m.desc}</div>
                    {m.disabled && m.id === 'VIREMENT' && (
                      <div style={{ fontSize:'0.68rem', color:'#EF4444', fontFamily:'system-ui', marginTop:2 }}>
                        ⚠️ Le conducteur n'a pas renseigné ses coordonnées bancaires
                      </div>
                    )}
                  </div>
                  <div style={{ width:18, height:18, borderRadius:'50%', border:`2px solid ${methode === m.id ? m.color : '#D1D5DB'}`, background: methode === m.id ? m.color : 'white', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                    {methode === m.id && <div style={{ width:7, height:7, borderRadius:'50%', background:'white' }} />}
                  </div>
                </div>
              ))}

              {/* Quand payer — colis seulement */}
              {type === 'COLIS' && (
                <>
                  <div style={{ fontSize:'0.75rem', fontWeight:700, color:'#374151', fontFamily:'system-ui', textTransform:'uppercase', letterSpacing:'0.5px', marginTop:'1.2rem', marginBottom:'0.8rem' }}>
                    Quand effectuer le paiement ?
                  </div>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.6rem', marginBottom:'1.2rem' }}>
                    {[
                      { id:'IMMEDIAT', label:'Maintenant', icon:'⚡', desc:'Avant enlèvement du colis' },
                      { id:'A_LA_LIVRAISON', label:'À la livraison', icon:'📬', desc:'Après confirmation OTP' }
                    ].map(m => (
                      <div key={m.id} onClick={() => setMomentPaiement(m.id)}
                        style={{ border: momentPaiement === m.id ? '2px solid #00875A' : '1.5px solid #E5E7EB', borderRadius:10, padding:'0.9rem', cursor:'pointer', background: momentPaiement === m.id ? '#E8F5F0' : 'white', textAlign:'center', transition:'all 0.15s' }}>
                        <div style={{ fontSize:'1.4rem', marginBottom:'0.3rem' }}>{m.icon}</div>
                        <div style={{ fontWeight:600, fontSize:'0.82rem', color: momentPaiement === m.id ? '#00875A' : '#111827', fontFamily:'system-ui' }}>{m.label}</div>
                        <div style={{ fontSize:'0.68rem', color:'#6B7280', fontFamily:'system-ui', marginTop:2 }}>{m.desc}</div>
                      </div>
                    ))}
                  </div>
                </>
              )}

              <div style={{ display:'flex', gap:'0.8rem', marginTop:'1rem' }}>
                <button onClick={onClose}
                  style={{ flex:1, padding:'0.8rem', background:'white', color:'#374151', border:'1px solid #D1D5DB', borderRadius:8, fontWeight:500, fontSize:'0.88rem', cursor:'pointer', fontFamily:'system-ui' }}>
                  Annuler
                </button>
                <button onClick={handleInitier} disabled={loading || !methode}
                  style={{ flex:2, padding:'0.8rem', background: loading || !methode ? '#9CA3AF' : '#111827', color:'white', border:'none', borderRadius:8, fontWeight:600, fontSize:'0.88rem', cursor: loading || !methode ? 'not-allowed' : 'pointer', fontFamily:'system-ui' }}>
                  {loading ? 'Chargement...' : 'Continuer →'}
                </button>
              </div>
            </>
          )}

          {/* ÉTAPE 2 — Coordonnées + instructions */}
          {etape === 2 && paiement && (
            <>
              {/* Espèces */}
              {methode === 'ESPECES' && (
                <div style={{ background:'#FFFBEB', border:'1px solid #FDE68A', borderRadius:12, padding:'1.2rem', marginBottom:'1.2rem' }}>
                  <div style={{ fontWeight:700, color:'#713F12', fontFamily:'system-ui', fontSize:'0.88rem', marginBottom:'0.8rem', display:'flex', alignItems:'center', gap:'0.5rem' }}>
                    💵 Instructions paiement en espèces
                  </div>
                  <div style={{ fontSize:'0.82rem', color:'#92400E', fontFamily:'system-ui', lineHeight:1.8 }}>
                    <div style={{ display:'flex', alignItems:'flex-start', gap:'0.5rem', marginBottom:'0.4rem' }}>
                      <span style={{ fontWeight:700, minWidth:20 }}>1.</span>
                      <span>Préparez exactement <strong>{montant} MAD</strong> en espèces</span>
                    </div>
                    <div style={{ display:'flex', alignItems:'flex-start', gap:'0.5rem', marginBottom:'0.4rem' }}>
                      <span style={{ fontWeight:700, minWidth:20 }}>2.</span>
                      <span>
                        {type === 'COVOITURAGE'
                          ? `Remettez la somme à ${nomBeneficiaire} lors de votre montée dans le véhicule`
                          : momentPaiement === 'A_LA_LIVRAISON'
                            ? `Remettez la somme à ${nomBeneficiaire} uniquement après avoir reçu votre colis et confirmé l'OTP`
                            : `Remettez la somme à ${nomBeneficiaire} lors de l'enlèvement du colis`}
                      </span>
                    </div>
                    <div style={{ display:'flex', alignItems:'flex-start', gap:'0.5rem' }}>
                      <span style={{ fontWeight:700, minWidth:20 }}>3.</span>
                      <span>Le conducteur devra confirmer la réception depuis son tableau de bord</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Virement */}
              {methode === 'VIREMENT' && infosBancaires && (
                <div style={{ marginBottom:'1.2rem' }}>
                  <div style={{ background:'#EFF6FF', border:'1px solid #BFDBFE', borderRadius:12, padding:'1.2rem', marginBottom:'1rem' }}>
                    <div style={{ fontWeight:700, color:'#1D4ED8', fontFamily:'system-ui', fontSize:'0.88rem', marginBottom:'1rem', display:'flex', alignItems:'center', gap:'0.5rem' }}>
                      🏦 Coordonnées bancaires de {nomBeneficiaire}
                    </div>
                    {[
                      ['Bénéficiaire', infosBancaires.nomComplet],
                      ['Banque', infosBancaires.banque],
                      ['RIB', infosBancaires.rib],
                      ['IBAN', infosBancaires.iban],
                      ['Montant exact', `${montant} MAD`],
                    ].filter(([,v]) => v).map(([label, value]) => (
                      <div key={label} style={{ display:'flex', justifyContent:'space-between', padding:'0.5rem 0', borderBottom:'1px solid #DBEAFE' }}>
                        <span style={{ fontSize:'0.78rem', color:'#6B7280', fontFamily:'system-ui' }}>{label}</span>
                        <span style={{ fontSize:'0.82rem', color:'#1E3A8A', fontWeight:700, fontFamily: label === 'RIB' || label === 'IBAN' ? 'monospace' : 'system-ui' }}>
                          {value}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div style={{ background:'#FEF9C3', border:'1px solid #FDE68A', borderRadius:8, padding:'0.8rem 1rem', marginBottom:'1rem', fontSize:'0.78rem', color:'#713F12', fontFamily:'system-ui' }}>
                    ⚠️ Utilisez exactement <strong>{montant} MAD</strong> comme montant. Indiquez votre nom en motif du virement.
                  </div>
                  <label style={{ fontSize:'0.72rem', fontWeight:700, color:'#374151', textTransform:'uppercase', letterSpacing:'0.4px', display:'block', marginBottom:'0.4rem', fontFamily:'system-ui' }}>
                    Référence / Numéro de transaction *
                  </label>
                  <input type="text" placeholder="Ex: VIR-20240523-001234"
                    value={reference} onChange={e => setReference(e.target.value)}
                    style={{ width:'100%', padding:'0.75rem', border:'1.5px solid #D1D5DB', borderRadius:8, fontSize:'0.88rem', outline:'none', fontFamily:'monospace', color:'#111827', boxSizing:'border-box' }} />
                  <div style={{ fontSize:'0.72rem', color:'#6B7280', fontFamily:'system-ui', marginTop:'0.4rem' }}>
                    Copiez la référence fournie par votre banque après le virement
                  </div>
                </div>
              )}

              {/* CMI */}
              {methode === 'CMI' && (
                <div style={{ marginBottom:'1.2rem' }}>
                  <div style={{ background:'#F5F3FF', border:'1px solid #DDD6FE', borderRadius:12, padding:'1.2rem', marginBottom:'1rem' }}>
                    <div style={{ fontWeight:700, color:'#7C3AED', fontFamily:'system-ui', fontSize:'0.88rem', marginBottom:'0.8rem' }}>
                      💳 Paiement sécurisé CMI
                    </div>
                    {infosBancaires?.cmiMerchantId && (
                      <div style={{ display:'flex', justifyContent:'space-between', padding:'0.5rem 0', borderBottom:'1px solid #DDD6FE', marginBottom:'0.8rem' }}>
                        <span style={{ fontSize:'0.78rem', color:'#6B7280', fontFamily:'system-ui' }}>ID Marchand CMI</span>
                        <span style={{ fontSize:'0.82rem', color:'#7C3AED', fontWeight:700, fontFamily:'monospace' }}>{infosBancaires.cmiMerchantId}</span>
                      </div>
                    )}
                    <div style={{ display:'flex', gap:'0.4rem', flexWrap:'wrap' }}>
                      {['VISA', 'Mastercard', 'CIH', 'BP', 'Attijariwafa', 'BMCE'].map(b => (
                        <span key={b} style={{ background:'white', border:'1px solid #DDD6FE', borderRadius:4, padding:'0.2rem 0.5rem', fontSize:'0.65rem', fontWeight:700, color:'#7C3AED', fontFamily:'system-ui' }}>{b}</span>
                      ))}
                    </div>
                  </div>
                  <label style={{ fontSize:'0.72rem', fontWeight:700, color:'#374151', textTransform:'uppercase', letterSpacing:'0.4px', display:'block', marginBottom:'0.4rem', fontFamily:'system-ui' }}>
                    Référence de transaction CMI *
                  </label>
                  <input type="text" placeholder="Ex: CMI-TXN-789456123"
                    value={reference} onChange={e => setReference(e.target.value)}
                    style={{ width:'100%', padding:'0.75rem', border:'1.5px solid #D1D5DB', borderRadius:8, fontSize:'0.88rem', outline:'none', fontFamily:'monospace', color:'#111827', boxSizing:'border-box' }} />
                </div>
              )}

              <div style={{ display:'flex', gap:'0.8rem' }}>
                <button onClick={() => setEtape(1)}
                  style={{ flex:1, padding:'0.8rem', background:'white', color:'#374151', border:'1px solid #D1D5DB', borderRadius:8, fontWeight:500, fontSize:'0.88rem', cursor:'pointer', fontFamily:'system-ui' }}>
                  ← Retour
                </button>
                <button onClick={handleDeclarer} disabled={loading}
                  style={{ flex:2, padding:'0.8rem', background: loading ? '#9CA3AF' : '#00875A', color:'white', border:'none', borderRadius:8, fontWeight:600, fontSize:'0.88rem', cursor: loading ? 'not-allowed' : 'pointer', fontFamily:'system-ui' }}>
                  {loading ? 'Envoi...' : methode === 'ESPECES' ? '✓ J\'ai remis les espèces' : `✓ J'ai effectué le virement de ${montant} MAD`}
                </button>
              </div>
            </>
          )}

          {/* ÉTAPE 3 — En attente validation conducteur */}
          {etape === 3 && paiement && (
            <div style={{ textAlign:'center', padding:'0.5rem 0' }}>
              <div style={{ width:72, height:72, borderRadius:'50%', background:'#DBEAFE', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 1.2rem', fontSize:'2.2rem' }}>
                📤
              </div>
              <div style={{ fontWeight:700, fontSize:'1.05rem', color:'#111827', fontFamily:'system-ui', marginBottom:'0.5rem' }}>
                Paiement déclaré !
              </div>
              <div style={{ fontSize:'0.82rem', color:'#6B7280', fontFamily:'system-ui', marginBottom:'1.5rem', lineHeight:1.6 }}>
                {methode === 'ESPECES'
                  ? `Vous avez confirmé la remise des espèces à ${nomBeneficiaire}.`
                  : `Votre virement de ${montant} MAD a été déclaré.`}
                <br />
                <strong style={{ color:'#1D4ED8' }}>En attente de validation par {nomBeneficiaire}.</strong>
              </div>

              {/* Référence */}
              {paiement.referenceClient && (
                <div style={{ background:'#F9FAFB', border:'1px solid #E5E7EB', borderRadius:8, padding:'0.8rem 1rem', marginBottom:'1.2rem', textAlign:'left' }}>
                  <div style={{ fontSize:'0.7rem', color:'#6B7280', fontFamily:'system-ui', marginBottom:4 }}>Référence de transaction</div>
                  <div style={{ fontFamily:'monospace', fontWeight:700, color:'#111827', fontSize:'0.9rem' }}>{paiement.referenceClient}</div>
                </div>
              )}

              {/* Timeline */}
              <div style={{ textAlign:'left', marginBottom:'1.5rem' }}>
                {[
                  { done: true, label: 'Paiement initié', sub: new Date(paiement.dateCreation).toLocaleString('fr-FR') },
                  { done: true, label: 'Paiement déclaré par vous', sub: new Date(paiement.datePaiementClient).toLocaleString('fr-FR') },
                  { done: false, label: `Validation par ${nomBeneficiaire}`, sub: 'En attente...' },
                  { done: false, label: 'Paiement confirmé', sub: '' },
                ].map((item, i) => (
                  <div key={i} style={{ display:'flex', gap:'0.8rem', marginBottom:'0.7rem' }}>
                    <div style={{ display:'flex', flexDirection:'column', alignItems:'center' }}>
                      <div style={{ width:20, height:20, borderRadius:'50%', background: item.done ? '#00875A' : '#E5E7EB', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'0.65rem', color: item.done ? 'white' : '#9CA3AF', flexShrink:0, fontWeight:700 }}>
                        {item.done ? '✓' : i+1}
                      </div>
                      {i < 3 && <div style={{ width:1, flex:1, background:'#E5E7EB', minHeight:12, margin:'2px 0' }} />}
                    </div>
                    <div style={{ paddingBottom:'0.2rem' }}>
                      <div style={{ fontSize:'0.82rem', fontWeight: item.done ? 600 : 400, color: item.done ? '#111827' : '#9CA3AF', fontFamily:'system-ui' }}>{item.label}</div>
                      {item.sub && <div style={{ fontSize:'0.7rem', color:'#6B7280', fontFamily:'system-ui' }}>{item.sub}</div>}
                    </div>
                  </div>
                ))}
              </div>

              <button onClick={onClose}
                style={{ width:'100%', padding:'0.85rem', background:'#111827', color:'white', border:'none', borderRadius:8, fontWeight:600, fontSize:'0.88rem', cursor:'pointer', fontFamily:'system-ui' }}>
                Fermer — Je serai notifié de la validation
              </button>
            </div>
          )}

          {/* ÉTAPE 4 — Confirmé */}
          {etape === 4 && paiement?.statut === 'CONFIRME' && (
            <div style={{ textAlign:'center', padding:'0.5rem 0' }}>
              <div style={{ width:72, height:72, borderRadius:'50%', background:'#E8F5F0', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 1.2rem', fontSize:'2.2rem' }}>
                ✅
              </div>
              <div style={{ fontWeight:700, fontSize:'1.05rem', color:'#00875A', fontFamily:'system-ui', marginBottom:'0.5rem' }}>
                Paiement confirmé !
              </div>
              <div style={{ fontSize:'0.82rem', color:'#6B7280', fontFamily:'system-ui', marginBottom:'1.5rem' }}>
                {nomBeneficiaire} a confirmé la réception de <strong>{montant} MAD</strong>
              </div>
              {paiement.noteConducteur && (
                <div style={{ background:'#E8F5F0', border:'1px solid #A7F3D0', borderRadius:8, padding:'0.8rem 1rem', marginBottom:'1.2rem', textAlign:'left' }}>
                  <div style={{ fontSize:'0.7rem', color:'#00875A', fontFamily:'system-ui', marginBottom:4, fontWeight:600 }}>Message du conducteur</div>
                  <div style={{ fontSize:'0.82rem', color:'#111827', fontFamily:'system-ui' }}>{paiement.noteConducteur}</div>
                </div>
              )}
              <button onClick={() => { onSuccess?.(); onClose() }}
                style={{ width:'100%', padding:'0.85rem', background:'#00875A', color:'white', border:'none', borderRadius:8, fontWeight:600, fontSize:'0.88rem', cursor:'pointer', fontFamily:'system-ui' }}>
                Parfait, fermer
              </button>
            </div>
          )}

          {/* Contesté */}
          {paiement?.statut === 'CONTESTE' && (
            <div style={{ textAlign:'center', padding:'0.5rem 0' }}>
              <div style={{ width:72, height:72, borderRadius:'50%', background:'#FEE2E2', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 1.2rem', fontSize:'2.2rem' }}>
                ⚠️
              </div>
              <div style={{ fontWeight:700, fontSize:'1.05rem', color:'#7F1D1D', fontFamily:'system-ui', marginBottom:'0.5rem' }}>
                Paiement contesté
              </div>
              <div style={{ fontSize:'0.82rem', color:'#6B7280', fontFamily:'system-ui', marginBottom:'1rem' }}>
                {nomBeneficiaire} indique ne pas avoir reçu le paiement.
              </div>
              {paiement.noteConducteur && (
                <div style={{ background:'#FEE2E2', border:'1px solid #FECACA', borderRadius:8, padding:'0.8rem 1rem', marginBottom:'1.2rem', textAlign:'left' }}>
                  <div style={{ fontSize:'0.7rem', color:'#7F1D1D', fontFamily:'system-ui', marginBottom:4, fontWeight:600 }}>Motif</div>
                  <div style={{ fontSize:'0.82rem', color:'#111827', fontFamily:'system-ui' }}>{paiement.noteConducteur}</div>
                </div>
              )}
              <button onClick={() => setEtape(2)}
                style={{ width:'100%', padding:'0.85rem', background:'#7F1D1D', color:'white', border:'none', borderRadius:8, fontWeight:600, fontSize:'0.88rem', cursor:'pointer', fontFamily:'system-ui', marginBottom:'0.6rem' }}>
                Réessayer le paiement
              </button>
              <button onClick={onClose}
                style={{ width:'100%', padding:'0.85rem', background:'white', color:'#374151', border:'1px solid #D1D5DB', borderRadius:8, fontWeight:500, fontSize:'0.88rem', cursor:'pointer', fontFamily:'system-ui' }}>
                Fermer
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}