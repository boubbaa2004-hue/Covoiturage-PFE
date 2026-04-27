import { Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'
import TrajetsPage from './pages/trajets/TrajetsPage'
import LivraisonPage from './pages/livraison/LivraisonPage'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/auth/login" element={<LoginPage />} />
      <Route path="/auth/register" element={<RegisterPage />} />
      <Route path="/trajets" element={<TrajetsPage />} />
      <Route path="/livraison" element={<LivraisonPage />} />
    </Routes>
  )
}