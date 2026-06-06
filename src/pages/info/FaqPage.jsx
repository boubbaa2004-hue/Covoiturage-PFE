import Header from '../../components/layout/Header'
import Footer from '../../components/layout/Footer'
import { useState } from 'react'

const faqs = [
  {
    q: 'Comment créer un compte sur CovoLiv ?',
    a: 'Cliquez sur "S\'inscrire" en haut de la page. Renseignez votre nom, email, mot de passe et choisissez votre rôle (Client ou Conducteur). Votre compte est créé immédiatement.'
  },
  {
    q: 'Comment réserver une place de covoiturage ?',
    a: 'Accédez à la page "Trajets", recherchez un trajet selon votre ville de départ et d\'arrivée. Sélectionnez le trajet qui vous convient et confirmez votre réservation. Le conducteur sera notifié et devra l\'accepter.'
  },
  {
    q: 'Comment envoyer un colis ?',
    a: 'Depuis votre tableau de bord, cliquez sur "Envoyer un colis". Renseignez la description, le poids, les villes et les coordonnées du destinataire. Un conducteur effectuant le même trajet vous proposera un prix.'
  },
  {
    q: 'Comment fonctionne le paiement P2P ?',
    a: 'Le paiement est direct entre le client et le conducteur. Vous pouvez payer par espèces, virement bancaire (RIB/IBAN) ou via CMI. Vous déclarez le paiement dans l\'application et le conducteur confirme sa réception.'
  },
  {
    q: 'À quoi sert le code OTP ?',
    a: 'Le code OTP (6 chiffres) est généré automatiquement lors de la création d\'une demande de colis. Il est transmis au destinataire final. Le conducteur devra saisir ce code pour confirmer la livraison, ce qui garantit que le colis a bien été remis à la bonne personne.'
  },
  {
    q: 'Comment devenir conducteur sur CovoLiv ?',
    a: 'Créez un compte en choisissant le rôle "Conducteur". Soumettez ensuite vos documents (permis de conduire, CIN, photo du véhicule, photo de profil). Un administrateur vérifie vos documents et valide votre compte. Une fois validé, vous pouvez publier des trajets et des offres de livraison.'
  },
  {
    q: 'Mes documents sont en attente de validation, que faire ?',
    a: 'Après soumission de vos documents, un administrateur les vérifie manuellement. Ce processus peut prendre quelques heures. Vous serez notifié dès que votre compte est validé ou si des documents supplémentaires sont requis.'
  },
  {
    q: 'Comment suivre mon colis en temps réel ?',
    a: 'Une fois votre colis pris en charge par le conducteur (statut EN_TRANSIT), une carte interactive apparaît dans votre tableau de bord. Elle affiche la position GPS du conducteur mise à jour en temps réel via Leaflet et OpenStreetMap.'
  },
  {
    q: 'Que faire en cas de problème avec un conducteur ?',
    a: 'Vous pouvez signaler un litige depuis votre tableau de bord (onglet Évaluations & Litiges) ou via la page "Signaler un problème". Décrivez le problème en détail et notre équipe prendra les mesures nécessaires.'
  },
  {
    q: 'La plateforme est-elle disponible dans toute le Maroc ?',
    a: 'CovoLiv est actuellement en phase de développement et testé dans la région de Béni Mellal. Le déploiement à l\'échelle nationale est prévu dans les prochaines versions.'
  },
]

export default function FaqPage() {
  const [open, setOpen] = useState(null)

  return (
    <>
      <Header />
      <div style={{ marginTop:108, background:'#F9FAFB', minHeight:'100vh' }}>

        <div style={{ background:'#111827', padding:'4rem 2rem' }}>
          <div style={{ maxWidth:800, margin:'0 auto', textAlign:'center' }}>
            <h1 style={{ fontWeight:800, fontSize:'2.4rem', color:'white', fontFamily:'system-ui,sans-serif', letterSpacing:'-0.5px', marginBottom:'1rem' }}>
              Questions fréquentes
            </h1>
            <p style={{ color:'rgba(255,255,255,0.55)', fontSize:'1rem', lineHeight:1.8, fontFamily:'system-ui,sans-serif' }}>
              Tout ce que vous devez savoir sur CovoLiv.
            </p>
          </div>
        </div>

        <div style={{ maxWidth:740, margin:'0 auto', padding:'3rem 2rem' }}>
          <div style={{ display:'flex', flexDirection:'column', gap:'0.6rem' }}>
            {faqs.map((faq, i) => (
              <div key={i} style={{ background:'white', borderRadius:12, border:'1px solid #E5E7EB', overflow:'hidden', transition:'box-shadow 0.2s', boxShadow: open===i ? '0 4px 16px rgba(0,135,90,0.1)' : '0 1px 3px rgba(0,0,0,0.04)' }}>
                <button
                  onClick={() => setOpen(open===i ? null : i)}
                  style={{ width:'100%', padding:'1.1rem 1.4rem', background:'none', border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'space-between', gap:'1rem', textAlign:'left' }}>
                  <span style={{ fontWeight:600, fontSize:'0.92rem', color:'#111827', fontFamily:'system-ui,sans-serif', lineHeight:1.4 }}>{faq.q}</span>
                  <span style={{ fontSize:'1.2rem', color: open===i ? '#00875A' : '#9CA3AF', flexShrink:0, transition:'transform 0.2s', transform: open===i ? 'rotate(45deg)' : 'rotate(0deg)' }}>+</span>
                </button>
                {open === i && (
                  <div style={{ padding:'0 1.4rem 1.2rem', borderTop:'1px solid #F3F4F6' }}>
                    <p style={{ color:'#6B7280', fontSize:'0.88rem', lineHeight:1.8, fontFamily:'system-ui,sans-serif', margin:'0.8rem 0 0' }}>{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* CTA contact */}
          <div style={{ marginTop:'2.5rem', background:'#111827', borderRadius:16, padding:'2rem', textAlign:'center' }}>
            <div style={{ fontWeight:700, color:'white', fontSize:'1rem', fontFamily:'system-ui,sans-serif', marginBottom:'0.4rem' }}>
              Vous n'avez pas trouvé votre réponse ?
            </div>
            <p style={{ color:'rgba(255,255,255,0.5)', fontSize:'0.85rem', fontFamily:'system-ui,sans-serif', marginBottom:'1.2rem' }}>
              Notre équipe est disponible pour vous aider.
            </p>
            <a href="/contact"
              style={{ display:'inline-block', background:'#00875A', color:'white', padding:'0.65rem 1.6rem', borderRadius:8, fontWeight:600, fontSize:'0.88rem', textDecoration:'none', fontFamily:'system-ui,sans-serif' }}>
              Nous contacter
            </a>
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}