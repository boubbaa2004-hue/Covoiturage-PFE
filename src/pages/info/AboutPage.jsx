import Header from '../../components/layout/Header'
import Footer from '../../components/layout/Footer'

export default function AboutPage() {
  return (
    <>
      <Header />
      <div style={{ marginTop:108, background:'#F9FAFB', minHeight:'100vh' }}>

        {/* Hero */}
        <div style={{ background:'#111827', padding:'4rem 2rem' }}>
          <div style={{ maxWidth:800, margin:'0 auto', textAlign:'center' }}>
            <div style={{ display:'inline-flex', alignItems:'center', gap:'0.4rem', background:'rgba(0,135,90,0.2)', color:'#6EE7B7', padding:'0.3rem 1rem', borderRadius:50, fontSize:'0.78rem', fontWeight:600, marginBottom:'1.2rem', fontFamily:'system-ui,sans-serif' }}>
              Projet PFE — L3 Informatique
            </div>
            <h1 style={{ fontWeight:800, fontSize:'2.4rem', color:'white', fontFamily:'system-ui,sans-serif', letterSpacing:'-0.5px', marginBottom:'1rem' }}>
              À propos de CovoLiv
            </h1>
            <p style={{ color:'rgba(255,255,255,0.55)', fontSize:'1.05rem', lineHeight:1.8, fontFamily:'system-ui,sans-serif' }}>
              Une plateforme hybride de covoiturage et livraison de colis conçue pour répondre aux besoins de mobilité et d'expédition au Maroc.
            </p>
          </div>
        </div>

        <div style={{ maxWidth:800, margin:'0 auto', padding:'3rem 2rem' }}>

          {/* Contexte */}
          <section style={{ marginBottom:'3rem' }}>
            <h2 style={{ fontWeight:700, fontSize:'1.4rem', color:'#111827', fontFamily:'system-ui,sans-serif', marginBottom:'1rem' }}>Contexte du projet</h2>
            <p style={{ color:'#374151', lineHeight:1.8, fontSize:'0.95rem', fontFamily:'system-ui,sans-serif' }}>
              CovoLiv est un projet de fin d'études (PFE) réalisé dans le cadre de la Licence en Informatique à la Faculté des Sciences et Techniques de Béni Mellal, relevant de l'Université Sultan Moulay Slimane (USMS). Il a été développé durant l'année universitaire 2025-2026.
            </p>
          </section>

          {/* Problématique */}
          <section style={{ marginBottom:'3rem' }}>
            <h2 style={{ fontWeight:700, fontSize:'1.4rem', color:'#111827', fontFamily:'system-ui,sans-serif', marginBottom:'1rem' }}>Problématique</h2>
            <p style={{ color:'#374151', lineHeight:1.8, fontSize:'0.95rem', fontFamily:'system-ui,sans-serif', marginBottom:'1rem' }}>
              La région de Béni Mellal-Khénifra, comme beaucoup de régions marocaines, souffre d'un manque de solutions numériques locales pour la mobilité partagée et l'expédition de colis entre particuliers. Les solutions existantes sont soit absentes, soit inadaptées au contexte local (langue, méthodes de paiement, infrastructure).
            </p>
            <p style={{ color:'#374151', lineHeight:1.8, fontSize:'0.95rem', fontFamily:'system-ui,sans-serif' }}>
              CovoLiv répond à ce besoin en proposant une plateforme unique combinant le covoiturage entre particuliers et la livraison de colis via les trajets déjà effectués par les conducteurs.
            </p>
          </section>

          {/* Solution */}
          <section style={{ marginBottom:'3rem' }}>
            <h2 style={{ fontWeight:700, fontSize:'1.4rem', color:'#111827', fontFamily:'system-ui,sans-serif', marginBottom:'1.2rem' }}>Ce que propose CovoLiv</h2>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem' }}>
              {[
                ['🚗', 'Covoiturage', 'Réservez une place sur un trajet publié par un conducteur vérifié.'],
                ['📦', 'Livraison colis', 'Envoyez un colis avec un conducteur qui fait le même trajet.'],
                ['💬', 'Chat intégré', 'Communiquez directement avec le conducteur avant et pendant le trajet.'],
                ['🔐', 'Validation OTP', 'Sécurisez la remise de vos colis grâce à un code à 6 chiffres.'],
                ['💰', 'Paiement P2P', 'Payez directement le conducteur par virement, espèces ou CMI.'],
                ['📍', 'Suivi GPS', 'Suivez votre colis en temps réel sur une carte interactive.'],
              ].map(([icon, title, desc]) => (
                <div key={title} style={{ background:'white', borderRadius:12, padding:'1.2rem', border:'1px solid #E5E7EB' }}>
                  <div style={{ fontSize:'1.5rem', marginBottom:'0.5rem' }}>{icon}</div>
                  <div style={{ fontWeight:700, color:'#111827', fontSize:'0.9rem', marginBottom:'0.3rem', fontFamily:'system-ui,sans-serif' }}>{title}</div>
                  <div style={{ color:'#6B7280', fontSize:'0.82rem', lineHeight:1.6, fontFamily:'system-ui,sans-serif' }}>{desc}</div>
                </div>
              ))}
            </div>
          </section>

          {/* Stack technique */}
          <section style={{ marginBottom:'3rem' }}>
            <h2 style={{ fontWeight:700, fontSize:'1.4rem', color:'#111827', fontFamily:'system-ui,sans-serif', marginBottom:'1.2rem' }}>Stack technique</h2>
            <div style={{ display:'flex', flexWrap:'wrap', gap:'0.6rem' }}>
              {['React.js', 'Vite', 'Spring Boot 3.2', 'Java 21', 'Spring Security + JWT', 'MySQL', 'Leaflet.js', 'OpenStreetMap', 'Maven', 'Swagger UI'].map(tech => (
                <span key={tech} style={{ background:'#E8F5F0', color:'#00875A', padding:'0.35rem 0.9rem', borderRadius:50, fontSize:'0.82rem', fontWeight:600, fontFamily:'system-ui,sans-serif' }}>
                  {tech}
                </span>
              ))}
            </div>
          </section>

          {/* Université */}
          <section style={{ background:'#111827', borderRadius:16, padding:'2rem', textAlign:'center' }}>
            <div style={{ color:'rgba(255,255,255,0.5)', fontSize:'0.82rem', fontFamily:'system-ui,sans-serif', marginBottom:'0.5rem' }}>Projet réalisé à</div>
            <div style={{ fontWeight:700, fontSize:'1.1rem', color:'white', fontFamily:'system-ui,sans-serif', marginBottom:'0.3rem' }}>
              Faculté des Sciences et Techniques de Béni Mellal
            </div>
            <div style={{ color:'rgba(255,255,255,0.5)', fontSize:'0.88rem', fontFamily:'system-ui,sans-serif', marginBottom:'1rem' }}>
              Université Sultan Moulay Slimane — 2025/2026
            </div>
            <a href="https://www.usms.ac.ma" target="_blank" rel="noreferrer"
              style={{ display:'inline-flex', alignItems:'center', gap:'0.4rem', background:'#00875A', color:'white', padding:'0.6rem 1.4rem', borderRadius:8, fontSize:'0.85rem', fontWeight:600, textDecoration:'none', fontFamily:'system-ui,sans-serif' }}>
              Visiter le site USMS ↗
            </a>
          </section>

        </div>
      </div>
      <Footer />
    </>
  )
}