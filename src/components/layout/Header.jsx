import { Link, useLocation, useNavigate } from 'react-router-dom'
import { getUser, isAuthenticated, logout } from '../../lib/api'

export default function Header() {
  const location = useLocation()
  const navigate = useNavigate()
  const connecte = isAuthenticated()
  const user = getUser()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const dashboardUrl = user?.role === 'ADMIN' ? '/dashboard/admin' :
                       user?.role === 'CONDUCTEUR' ? '/dashboard/conducteur' :
                       '/dashboard/client'

  // Livraison colis n'est PAS dans le menu public
  const nav = [
    { to: '/', label: 'Accueil' },
    { to: '/trajets', label: 'Trajets' },
  ]

  return (
    <header style={{ position:'fixed', top:0, left:0, right:0, zIndex:1000, background:'rgba(255,255,255,0.97)', backdropFilter:'blur(20px)', borderBottom:'1px solid var(--border)' }}>
      <div style={{ background:'var(--primary-dark)', padding:'0.4rem 0', textAlign:'center', fontSize:'0.78rem', color:'rgba(255,255,255,0.85)', letterSpacing:'0.3px' }}>
        Plateforme 100% marocaine — <span style={{ color:'var(--gold)', fontWeight:600 }}>Béni Mellal · Casa · Marrakech · Rabat</span>
      </div>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 3rem', height:68, maxWidth:1280, margin:'0 auto' }}>

        {/* Logo */}
        <Link to="/" style={{ display:'flex', alignItems:'center', gap:'0.6rem', textDecoration:'none' }}>
          <div style={{ width:36, height:36, background:'var(--primary)', borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center', color:'white', fontWeight:800, fontSize:'1.1rem', fontFamily:'Bricolage Grotesque,sans-serif' }}>C</div>
          <span style={{ fontFamily:'Bricolage Grotesque,sans-serif', fontWeight:800, fontSize:'1.5rem', color:'var(--primary-dark)' }}>
            Covoit<span style={{ color:'var(--accent)' }}>Go</span>
          </span>
        </Link>

        {/* Navigation */}
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

        {/* Droite */}
        <div style={{ display:'flex', alignItems:'center', gap:'0.8rem' }}>
          {connecte ? (
            <>
              <Link to={dashboardUrl} style={{ textDecoration:'none', display:'flex', alignItems:'center', gap:'0.6rem', padding:'0.45rem 1rem', border:'1.5px solid var(--border)', borderRadius:8, background:'white' }}>
                <div style={{ width:28, height:28, borderRadius:'50%', background:'var(--primary)', display:'flex', alignItems:'center', justifyContent:'center', color:'white', fontWeight:700, fontSize:'0.75rem', fontFamily:'system-ui,sans-serif', flexShrink:0 }}>
                  {user?.nom?.split(' ').map(n=>n[0]).join('').toUpperCase().slice(0,2) || 'U'}
                </div>
                <span style={{ fontSize:'0.88rem', fontWeight:500, color:'#111', fontFamily:'system-ui,sans-serif' }}>
                  {user?.nom}
                </span>
              </Link>
              <button onClick={handleLogout}
                style={{ padding:'0.5rem 1.2rem', background:'transparent', color:'var(--muted)', border:'1.5px solid var(--border)', borderRadius:8, fontSize:'0.88rem', fontWeight:500, cursor:'pointer', fontFamily:'inherit' }}>
                Déconnexion
              </button>
            </>
          ) : (
            <>
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
            </>
          )}
        </div>
      </div>
    </header>
  )
}