import Header from '../../components/layout/Header'
import Footer from '../../components/layout/Footer'
import TrajetCard from '../../components/home/TrajetCard'

const all = [
  { type:'covoiturage', from:'Béni Mellal', to:'Casablanca', date:"📅 Aujourd'hui 08:00", seats:'💺 3 places', duration:'⏱ 3h30', driver:{ name:'Youssef A.', initials:'YA' }, price:'80 MAD', rating:'4.9', image:'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=500&q=80&fit=crop' },
  { type:'livraison', from:'Marrakech', to:'Rabat', date:'📅 Demain 10:30', seats:'📦 5 kg max', duration:'🔐 OTP', driver:{ name:'Karim F.', initials:'KF' }, price:'60 MAD', rating:'4.7', image:'https://images.unsplash.com/photo-1609743522653-52354461eb27?w=500&q=80&fit=crop' },
  { type:'covoiturage', from:'Fès', to:'Meknès', date:'📅 Demain 07:00', seats:'💺 2 places', duration:'⏱ 1h00', driver:{ name:'Sara B.', initials:'SB' }, price:'45 MAD', rating:'5.0', image:'https://images.unsplash.com/photo-1502877338535-766e1452684a?w=500&q=80&fit=crop' },
  { type:'covoiturage', from:'Agadir', to:'Marrakech', date:'📅 Demain 09:00', seats:'💺 4 places', duration:'⏱ 2h30', driver:{ name:'Omar L.', initials:'OL' }, price:'70 MAD', rating:'4.8', image:'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=500&q=80&fit=crop' },
]

export default function TrajetsPage() {
  return (
    <>
      <Header />
      <div style={{ marginTop:108, background:'var(--gray)', minHeight:'100vh', padding:'3rem' }}>
        <div style={{ maxWidth:1280, margin:'0 auto' }}>
          <h1 style={{ fontFamily:'Bricolage Grotesque, sans-serif', fontSize:'2.4rem', fontWeight:800, color:'var(--dark)', marginBottom:'0.5rem' }}>
            Tous les <span style={{ color:'var(--primary)' }}>trajets</span>
          </h1>
          <p style={{ color:'var(--muted)', marginBottom:'2rem' }}>Des centaines d'annonces publiées chaque jour par des conducteurs vérifiés.</p>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(290px, 1fr))', gap:'1.5rem' }}>
            {all.map((t, i) => <TrajetCard key={i} {...t} />)}
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}