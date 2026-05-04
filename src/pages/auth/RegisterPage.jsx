import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Header from '../../components/layout/Header'
import Footer from '../../components/layout/Footer'
import { register } from '../../lib/api'

export default function RegisterPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    nom:'', email:'', motDePasse:'', telephone:'', role:'CLIENT'
  })
  const [fichiers, setFichiers] = useState({
    permis: null, cin: null, photoVoiture: null, carteGrise: null
  })
  const [marqueVoiture, setMarqueVoiture] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleFichier = (key, file) => {
    setFichiers(prev => ({...prev, [key]: file}))
  }

  const handleSubmit = async () => {
    setError('')
    if (!form.nom || !form.email || !form.motDePasse) {
      setError('Veuillez remplir tous les champs obligatoires')
      return
    }
    if (form.role === 'CONDUCTEUR') {
      if (!fichiers.permis || !fichiers.cin || !fichiers.photoVoiture) {
        setError('Permis, CIN et photo du véhicule sont obligatoires')
        return
      }
      if (!marqueVoiture) {
        setError('Veuillez indiquer la marque du véhicule')
        return
      }
    }
    setLoading(true)
    try {
      // Étape 1 : créer le compte
      const data = await register({
        ...form,
        permisConduire: marqueVoiture || '',
        pieceIdentite: '',
        marqueVoiture: marqueVoiture,
      })
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data))

      // Étape 2 : si conducteur, upload les documents
      if (form.role === 'CONDUCTEUR') {
        const formData = new FormData()
        formData.append('permis', fichiers.permis)
        formData.append('cin', fichiers.cin)
        formData.append('photoVoiture', fichiers.photoVoiture)
        if (fichiers.carteGrise) formData.append('carteGrise', fichiers.carteGrise)
        formData.append('marqueVoiture', marqueVoiture)

        await fetch('http://localhost:8080/api/documents/upload', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${data.token}` },
          body: formData
        })
      }

      if (data.role === 'CLIENT') navigate('/dashboard/client')
      else if (data.role === 'CONDUCTEUR') navigate('/dashboard/conducteur')
    } catch (e) {
      setError(e.message || 'Erreur lors de l\'inscription')
    } finally {
      setLoading(false)
    }
  }

  const FileUpload = ({ id, label, hint, accept, fileKey }) => (
    <div style={{ marginBottom:'1.2rem' }}>
      <label style={{ fontSize:'0.78rem', fontWeight:700, color:'var(--muted)', textTransform:'uppercase', letterSpacing:'0.5px', display:'block', marginBottom:'0.4rem' }}>{label}</label>
      <div
        onClick={() => document.getElementById(id).click()}
        style={{ border:'2px dashed var(--border)', borderRadius:10, padding:'1rem', textAlign:'center', background:'var(--gray)', cursor:'pointer' }}
        onMouseEnter={e => e.currentTarget.style.borderColor='var(--primary)'}
        onMouseLeave={e => e.currentTarget.style.borderColor='var(--border)'}
      >
        <input id={id} type="file" accept={accept} style={{ display:'none' }}
          onChange={e => handleFichier(fileKey, e.target.files[0])} />
        {fichiers[fileKey] ? (
          <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:'0.8rem', flexWrap:'wrap' }}>
            {fichiers[fileKey].type?.startsWith('image/') ? (
              <img src={URL.createObjectURL(fichiers[fileKey])} alt="preview"
                style={{ width:56, height:56, objectFit:'cover', borderRadius:8, border:'2px solid var(--primary)' }} />
            ) : (
              <span style={{ fontSize:'2rem' }}>📄</span>
            )}
            <div style={{ textAlign:'left' }}>
              <div style={{ fontSize:'0.85rem', fontWeight:600, color:'var(--primary)' }}>{fichiers[fileKey].name}</div>
              <div style={{ fontSize:'0.75rem', color:'var(--muted)' }}>{(fichiers[fileKey].size/1024).toFixed(0)} KB</div>
            </div>
            <button onClick={e => { e.stopPropagation(); handleFichier(fileKey, null) }}
              style={{ background:'#FDEDED', border:'none', color:'#C62828', cursor:'pointer', padding:'0.3rem 0.6rem', borderRadius:6, fontSize:'0.8rem', fontWeight:700 }}>
              ✕
            </button>
          </div>
        ) : (
          <div>
            <div style={{ fontSize:'1.8rem', marginBottom:'0.3rem' }}>{accept.includes('image') ? '📷' : '📄'}</div>
            <p style={{ color:'var(--muted)', fontSize:'0.82rem', margin:0 }}>{hint}</p>
            <p style={{ color:'var(--primary)', fontSize:'0.78rem', fontWeight:600, margin:'0.3rem 0 0' }}>Cliquer pour sélectionner</p>
          </div>
        )}
      </div>
    </div>
  )

  return (
    <>
      <Header />
      <div style={{ marginTop:108, minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'var(--gray)', padding:'3rem 1rem' }}>
        <div style={{ background:'white', borderRadius:20, padding:'2.5rem', width:'100%', maxWidth:540, border:'1px solid var(--border)', boxShadow:'0 20px 60px rgba(0,0,0,0.08)' }}>
          <h2 style={{ fontFamily:'Bricolage Grotesque,sans-serif', fontSize:'1.8rem', fontWeight:800, color:'var(--dark)', marginBottom:'0.5rem' }}>Créer un compte</h2>
          <p style={{ color:'var(--muted)', fontSize:'0.9rem', marginBottom:'1.5rem' }}>Rejoignez CovoLiv gratuitement 🚗</p>

          {error && (
            <div style={{ background:'#FDEDED', color:'#C62828', padding:'0.8rem 1rem', borderRadius:8, fontSize:'0.88rem', marginBottom:'1rem', fontWeight:600 }}>❌ {error}</div>
          )}

          {/* Choix rôle */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.8rem', marginBottom:'1.5rem' }}>
            {[['CLIENT','👤 Passager / Expéditeur'],['CONDUCTEUR','🚗 Conducteur']].map(([role, label]) => (
              <button key={role} onClick={() => setForm({...form, role})}
                style={{ padding:'0.8rem', borderRadius:10, border: form.role===role ? '2px solid var(--primary)' : '1.5px solid var(--border)', background: form.role===role ? 'var(--primary-light)' : 'white', color: form.role===role ? 'var(--primary)' : 'var(--muted)', fontWeight: form.role===role ? 700 : 500, fontSize:'0.88rem', cursor:'pointer', fontFamily:'inherit' }}>
                {label}
              </button>
            ))}
          </div>

          {/* Champs communs */}
          {[
            ['Nom complet *','text','nom','Prénom Nom'],
            ['Email *','email','email','votre@email.com'],
            ['Téléphone','tel','telephone','06 XX XX XX XX'],
            ['Mot de passe *','password','motDePasse','••••••••'],
          ].map(([label,type,key,placeholder]) => (
            <div key={key} style={{ marginBottom:'1rem' }}>
              <label style={{ fontSize:'0.78rem', fontWeight:700, color:'var(--muted)', textTransform:'uppercase', letterSpacing:'0.5px', display:'block', marginBottom:'0.4rem' }}>{label}</label>
              <input type={type} placeholder={placeholder} value={form[key]}
                onChange={e => setForm({...form, [key]: e.target.value})}
                style={{ width:'100%', padding:'0.85rem 1rem', border:'1.5px solid var(--border)', borderRadius:10, fontSize:'0.92rem', outline:'none', fontFamily:'inherit' }} />
            </div>
          ))}

          {/* Champs conducteur */}
          {form.role === 'CONDUCTEUR' && (
            <div>
              <div style={{ background:'#FFF8E6', borderRadius:10, padding:'1rem', marginBottom:'1.2rem', display:'flex', gap:'0.8rem' }}>
                <span style={{ fontSize:'1.2rem' }}>📋</span>
                <div>
                  <div style={{ fontWeight:700, color:'#92610A', fontSize:'0.88rem', marginBottom:2 }}>Documents requis</div>
                  <div style={{ color:'#92610A', fontSize:'0.82rem' }}>Votre compte sera en attente de validation avant de pouvoir publier des trajets.</div>
                </div>
              </div>

              {/* Marque véhicule */}
              <div style={{ marginBottom:'1.2rem' }}>
                <label style={{ fontSize:'0.78rem', fontWeight:700, color:'var(--muted)', textTransform:'uppercase', letterSpacing:'0.5px', display:'block', marginBottom:'0.4rem' }}>Marque et modèle du véhicule *</label>
                <input type="text" placeholder="Ex: Toyota Corolla 2020" value={marqueVoiture}
                  onChange={e => setMarqueVoiture(e.target.value)}
                  style={{ width:'100%', padding:'0.85rem 1rem', border:'1.5px solid var(--border)', borderRadius:10, fontSize:'0.92rem', outline:'none', fontFamily:'inherit' }} />
              </div>

              <FileUpload id="reg-permis" label="📷 Photo Permis de conduire *" hint="Photo JPG ou PNG" accept="image/*" fileKey="permis" />
              <FileUpload id="reg-cin" label="📷 Photo Pièce d'identité (CIN) *" hint="Photo JPG ou PNG" accept="image/*" fileKey="cin" />
              <FileUpload id="reg-voiture" label="📷 Photo du véhicule *" hint="Photo JPG ou PNG" accept="image/*" fileKey="photoVoiture" />
              <FileUpload id="reg-cartegrise" label="📄 Carte grise (optionnel)" hint="Fichier PDF" accept=".pdf" fileKey="carteGrise" />

              <div style={{ background:'#E6F1FB', borderRadius:10, padding:'1rem', marginBottom:'1rem' }}>
                <p style={{ color:'#185FA5', fontSize:'0.82rem', fontWeight:600, margin:0 }}>
                  ℹ️ Après inscription, votre compte sera en statut <strong>"En attente de validation"</strong>. L'admin vérifiera vos documents et vous activera dans les plus brefs délais.
                </p>
              </div>
            </div>
          )}

          <button onClick={handleSubmit} disabled={loading}
            style={{ width:'100%', padding:'1rem', background: loading ? 'var(--muted)' : 'var(--primary)', color:'white', border:'none', borderRadius:10, fontSize:'1rem', fontWeight:700, cursor: loading ? 'not-allowed' : 'pointer', fontFamily:'inherit', marginTop:'0.5rem' }}>
            {loading ? '⏳ Création en cours...' : 'Créer mon compte'}
          </button>

          <p style={{ textAlign:'center', marginTop:'1.5rem', fontSize:'0.88rem', color:'var(--muted)' }}>
            Déjà un compte ? <Link to="/auth/login" style={{ color:'var(--primary)', fontWeight:600, textDecoration:'none' }}>Se connecter</Link>
          </p>
        </div>
      </div>
      <Footer />
    </>
  )
}