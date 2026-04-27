import Header from '../../components/layout/Header'
import Footer from '../../components/layout/Footer'

export default function RegisterPage() {
  return (
    <>
      <Header />
      <div style={{ marginTop:108, minHeight:'70vh', display:'flex', alignItems:'center', justifyContent:'center', background:'var(--gray)', padding:'3rem' }}>
        <div style={{ background:'white', borderRadius:20, padding:'3rem', width:'100%', maxWidth:480, border:'1px solid var(--border)', boxShadow:'0 20px 60px rgba(0,0,0,0.08)' }}>
          <h2 style={{ fontFamily:'Bricolage Grotesque, sans-serif', fontSize:'1.8rem', fontWeight:800, color:'var(--dark)', marginBottom:'0.5rem' }}>Créer un compte</h2>
          <p style={{ color:'var(--muted)', fontSize:'0.9rem', marginBottom:'2rem' }}>Rejoignez CovoitGo gratuitement 🚗</p>
          {[['Prénom','text','Votre prénom'],['Nom','text','Votre nom'],['Email','email','votre@email.com'],['Téléphone','tel','06 XX XX XX XX'],['Mot de passe','password','••••••••']].map(([label, type, placeholder]) => (
            <div key={label} style={{ marginBottom:'1rem' }}>
              <label style={{ fontSize:'0.8rem', fontWeight:600, color:'var(--text)', display:'block', marginBottom:'0.4rem' }}>{label}</label>
              <input type={type} placeholder={placeholder} style={{ width:'100%', padding:'0.85rem 1rem', border:'1.5px solid var(--border)', borderRadius:10, fontSize:'0.92rem', outline:'none', fontFamily:'inherit' }} />
            </div>
          ))}
          <button style={{ width:'100%', padding:'1rem', background:'var(--primary)', color:'white', border:'none', borderRadius:10, fontSize:'1rem', fontWeight:700, cursor:'pointer', marginTop:'0.5rem', fontFamily:'inherit' }}>
            Créer mon compte
          </button>
          <p style={{ textAlign:'center', marginTop:'1.5rem', fontSize:'0.88rem', color:'var(--muted)' }}>
            Déjà un compte ? <a href="/auth/login" style={{ color:'var(--primary)', fontWeight:600, textDecoration:'none' }}>Se connecter</a>
          </p>
        </div>
      </div>
      <Footer />
    </>
  )
}