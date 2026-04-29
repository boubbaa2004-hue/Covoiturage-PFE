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
    </Routes>
  )
}