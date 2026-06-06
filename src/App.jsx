import { Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'
import TrajetsPage from './pages/trajets/TrajetsPage'
import TrajetDetail from './pages/trajets/TrajetDetail'
import LivraisonPage from './pages/livraison/LivraisonPage'
import ClientDashboard from './pages/dashboard/client/ClientDashboard'
import ConducteurDashboard from './pages/dashboard/conducteur/ConducteurDashboard'
import AdminDashboard from './pages/dashboard/admin/AdminDashboard'
import AboutPage from './pages/info/AboutPage'
import TeamPage from './pages/info/TeamPage'
import ContactPage from './pages/info/ContactPage'
import SignalerPage from './pages/info/SignalerPage'
import FaqPage from './pages/info/FaqPage'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/auth/login" element={<LoginPage />} />
      <Route path="/auth/register" element={<RegisterPage />} />
      <Route path="/trajets" element={<TrajetsPage />} />
      <Route path="/trajets/:id" element={<TrajetDetail />} />
      <Route path="/livraison" element={<LivraisonPage />} />
      <Route path="/dashboard/client" element={<ClientDashboard />} />
      <Route path="/dashboard/conducteur" element={<ConducteurDashboard />} />
      <Route path="/dashboard/admin" element={<AdminDashboard />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/team" element={<TeamPage />} />
      <Route path="/contact" element={<ContactPage />} />
      <Route path="/signaler" element={<SignalerPage />} />
      <Route path="/faq" element={<FaqPage />} />
    </Routes>
  )
}
