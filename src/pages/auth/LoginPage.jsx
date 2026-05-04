import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Header from '../../components/layout/Header'
import Footer from '../../components/layout/Footer'
import { login } from '../../lib/api'

export default function LoginPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', motDePasse: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    setError('')
    setLoading(true)
    try {
      const data = await login(form)
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data))

      if (data.role === 'CLIENT') navigate('/dashboard/client')
      else if (data.role === 'CONDUCTEUR') navigate('/dashboard/conducteur')
      else if (data.role === 'ADMIN') navigate('/dashboard/admin')
    } catch (e) {
      setError('Email ou mot de passe incorrect')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Header />
      <div style={{ marginTop:108, minHeight:'70vh', display:'flex', alignItems:'center', justifyContent:'center', background:'var(--gray)' }}>
        <div style={{ background:'white', borderRadius:20, padding:'3rem', width:'100%', maxWidth:420, border:'1px solid var(--border)', boxShadow:'0 20px 60px rgba(0,0,0,0.08)' }}>
          <h2 style={{ fontFamily:'Bricolage Grotesque,sans-serif', fontSize:'1.8rem', fontWeight:800, color:'var(--dark)', marginBottom:'0.5rem' }}>Connexion</h2>
          <p style={{ color:'var(--muted)', fontSize:'0.9rem', marginBottom:'2rem' }}>Bon retour sur CovoLiv 👋</p>

          {error && (
            <div style={{ background:'#FDEDED', color:'#C62828', padding:'0.8rem 1rem', borderRadius:8, fontSize:'0.88rem', marginBottom:'1rem', fontWeight:600 }}>
              ❌ {error}
            </div>
          )}

          <div style={{ marginBottom:'1rem' }}>
            <label style={{ fontSize:'0.8rem', fontWeight:600, color:'var(--text)', display:'block', marginBottom:'0.4rem' }}>Email</label>
            <input
              type="email"
              placeholder="votre@email.com"
              value={form.email}
              onChange={e => setForm({...form, email: e.target.value})}
              style={{ width:'100%', padding:'0.85rem 1rem', border:'1.5px solid var(--border)', borderRadius:10, fontSize:'0.92rem', outline:'none', fontFamily:'inherit' }}
            />
          </div>

          <div style={{ marginBottom:'1.5rem' }}>
            <label style={{ fontSize:'0.8rem', fontWeight:600, color:'var(--text)', display:'block', marginBottom:'0.4rem' }}>Mot de passe</label>
            <input
              type="password"
              placeholder="••••••••"
              value={form.motDePasse}
              onChange={e => setForm({...form, motDePasse: e.target.value})}
              style={{ width:'100%', padding:'0.85rem 1rem', border:'1.5px solid var(--border)', borderRadius:10, fontSize:'0.92rem', outline:'none', fontFamily:'inherit' }}
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading}
            style={{ width:'100%', padding:'1rem', background: loading ? 'var(--muted)' : 'var(--primary)', color:'white', border:'none', borderRadius:10, fontSize:'1rem', fontWeight:700, cursor: loading ? 'not-allowed' : 'pointer', fontFamily:'inherit' }}>
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>

          <p style={{ textAlign:'center', marginTop:'1.5rem', fontSize:'0.88rem', color:'var(--muted)' }}>
            Pas encore de compte ? <Link to="/auth/register" style={{ color:'var(--primary)', fontWeight:600, textDecoration:'none' }}>S'inscrire</Link>
          </p>
        </div>
      </div>
      <Footer />
    </>
  )
}