import Header from '../components/layout/Header'
import Hero from '../components/home/Hero'
import StatsBar from '../components/home/StatsBar'
import HowItWorks from '../components/home/HowItWorks'
import TrajetCard from '../components/home/TrajetCard'
import Services from '../components/home/Services'
import Testimonials from '../components/home/Testimonials'
import Footer from '../components/layout/Footer'

const trajets = [
  { type:'covoiturage', from:'Béni Mellal', to:'Casablanca', date:"📅 Aujourd'hui 08:00", seats:'💺 3 places', duration:'⏱ 3h30', driver:{ name:'Youssef A.', initials:'YA' }, price:'80 MAD', rating:'4.9', image:'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=500&q=80&fit=crop' },
  { type:'livraison', from:'Marrakech', to:'Rabat', date:'📅 Demain 10:30', seats:'📦 5 kg max', duration:'🔐 OTP', driver:{ name:'Karim F.', initials:'KF' }, price:'60 MAD', rating:'4.7', image:'https://images.unsplash.com/photo-1609743522653-52354461eb27?w=500&q=80&fit=crop' },
  { type:'covoiturage', from:'Fès', to:'Meknès', date:'📅 Demain 07:00', seats:'💺 2 places', duration:'⏱ 1h00', driver:{ name:'Sara B.', initials:'SB' }, price:'45 MAD', rating:'5.0', image:'https://images.unsplash.com/photo-1502877338535-766e1452684a?w=500&q=80&fit=crop' },
]

export default function HomePage() {
  return (
    <>
      <Header />
      <Hero />
      <StatsBar />
      <HowItWorks />

      {/* Section Trajets */}
      <div style={{ background:'white', padding:'5rem 3rem' }}>
        <div style={{ maxWidth:1280, margin:'0 auto' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end', marginBottom:'2.5rem' }}>
            <div>
              <div style={{ display:'inline-flex', alignItems:'center', gap:'0.5rem', background:'var(--primary-light)', color:'var(--primary)', padding:'0.35rem 1rem', borderRadius:50, fontSize:'0.78rem', fontWeight:700, marginBottom:'1rem' }}>
                <span style={{ width:5, height:5, background:'var(--primary)', borderRadius:'50%' }} /> Trajets disponibles
              </div>
              <h2 style={{ fontFamily:'Bricolage Grotesque, sans-serif', fontSize:'2.6rem', fontWeight:800, color:'var(--dark)' }}>
                Partez <span style={{ color:'var(--primary)' }}>aujourd'hui</span>
              </h2>
            </div>
            <a href="/trajets" style={{ color:'var(--primary)', fontWeight:600, textDecoration:'none' }}>Voir tous les trajets →</a>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(290px, 1fr))', gap:'1.5rem' }}>
            {trajets.map((t, i) => <TrajetCard key={i} {...t} />)}
          </div>
        </div>
      </div>

      <Services />
      <Testimonials />
      <Footer />
    </>
  )
}