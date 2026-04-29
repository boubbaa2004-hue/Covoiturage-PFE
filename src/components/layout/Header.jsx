import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'

export default function Header() {
  const location = useLocation()
  const nav = [
    { to: '/', label: 'Accueil' },
    { to: '/trajets', label: 'Trajets' },
    { to: '/livraison', label: 'Livraison colis' },
  ]

  return (
    <header style={{ position:'fixed', top:0, left:0, right:0, zIndex:1000, background:'rgba(255,255,255,0.97)', backdropFilter:'blur(20px)', borderBottom:'1px solid var(--border)' }}>
      <div style={{ background:'var(--primary-dark)', padding:'0.4rem 0', textAlign:'center', fontSize:'0.78rem', color:'rgba(255,255,255,0.85)', letterSpacing:'0.3px' }}>
        🇲🇦 Plateforme 100% marocaine — <span style={{ color:'var(--gold)', fontWeight:600 }}>Béni Mellal · Casa · Marrakech · Rabat</span>
      </div>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 3rem', height:68, maxWidth:1280, margin:'0 auto' }}>
        <Link to="/" style={{ display:'flex', alignItems:'center', gap:'0.6rem', textDecoration:'none' }}>
          <div style={{ width:36, height:36, background:'var(--primary)', borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center', color:'white', fontWeight:800, fontSize:'1.1rem', fontFamily:'Bricolage Grotesque, sans-serif' }}>C</div>
          <span style={{ fontFamily:'Bricolage Grotesque, sans-serif', fontWeight:800, fontSize:'1.5rem', color:'var(--primary-dark)' }}>Covoit<span style={{ color:'var(--accent)' }}>Go</span></span>
        </Link>

        <nav style={{ display:'flex', alignItems:'center', gap:'0.3rem' }}>
          {nav.map(({ to, label }) => {
            const active = location.pathname === to
            return (
              <Link key={to} to={to} style={{ padding:'0.5rem 1rem', borderRadius:8, color: active ? 'var(--primary)' : 'var(--muted)', fontWeight: active ? 600 : 500, textDecoration:'none', fontSize:'0.88rem', background: active ? 'var(--primary-light)' : 'transparent' }}>
                {label}
              </Link>
            )
          })}
        </nav>

        <div style={{ display:'flex', alignItems:'center', gap:'0.8rem' }}>
          <Link to="/auth/login">
            <button style={{ padding:'0.55rem 1.2rem', borderRadius:8, border:'1.5px solid var(--border)', background:'transparent', color:'var(--text)', fontSize:'0.88rem', fontWeight:500, cursor:'pointer', fontFamily:'inherit' }}>
              Connexion
            </button>
          </Link>
          <Link to="/auth/register">
            <button style={{ padding:'0.55rem 1.4rem', borderRadius:8, border:'none', background:'var(--primary)', color:'white', fontSize:'0.88rem', fontWeight:600, cursor:'pointer', fontFamily:'inherit' }}>
              S'inscrire
            </button>
          </Link>
        </div>
      </div>
    </header>
  )
}