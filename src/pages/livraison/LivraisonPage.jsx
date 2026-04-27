import Header from '../../components/layout/Header'
import Footer from '../../components/layout/Footer'

export default function LivraisonPage() {
  return (
    <>
      <Header />
      <div style={{ marginTop:108, background:'var(--gray)', minHeight:'70vh', display:'flex', alignItems:'center', justifyContent:'center' }}>
        <div style={{ textAlign:'center' }}>
          <div style={{ fontSize:'4rem', marginBottom:'1rem' }}>📦</div>
          <h1 style={{ fontFamily:'Bricolage Grotesque, sans-serif', fontSize:'2rem', fontWeight:800, color:'var(--dark)', marginBottom:'0.5rem' }}>Livraison de colis</h1>
          <p style={{ color:'var(--muted)' }}>Page en cours de développement</p>
        </div>
      </div>
      <Footer />
    </>
  )
}