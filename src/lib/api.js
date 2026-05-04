const API_URL = 'http://localhost:8080/api'

// ── AUTH ──
export const register = async (data) => {
  const res = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
  if (!res.ok) throw new Error('Erreur inscription')
  return res.json()
}

export const login = async (data) => {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
  if (!res.ok) throw new Error('Email ou mot de passe incorrect')
  return res.json()
}

// ── TOKEN ──
export const getToken = () => localStorage.getItem('token')
export const getUser = () => JSON.parse(localStorage.getItem('user') || '{}')
export const isAuthenticated = () => !!getToken()

export const logout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
}

// ── HEADERS ──
const authHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${getToken()}`
})

// ── TRAJETS ──
export const getTrajets = async () => {
  const res = await fetch(`${API_URL}/trajets`)
  return res.json()
}

export const getTrajetById = async (id) => {
  const res = await fetch(`${API_URL}/trajets/${id}`)
  return res.json()
}

export const rechercherTrajets = async (villeDepart, villeArrivee) => {
  const res = await fetch(`${API_URL}/trajets/recherche?villeDepart=${villeDepart}&villeArrivee=${villeArrivee}`)
  return res.json()
}

export const creerTrajet = async (data) => {
  const res = await fetch(`${API_URL}/trajets`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(data)
  })
  return res.json()
}

export const getMesTrajets = async () => {
  const res = await fetch(`${API_URL}/trajets/mes-trajets`, {
    headers: authHeaders()
  })
  return res.json()
}

// ── RÉSERVATIONS ──
export const creerReservation = async (data) => {
  const res = await fetch(`${API_URL}/reservations`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(data)
  })
  return res.json()
}

export const getMesReservations = async () => {
  const res = await fetch(`${API_URL}/reservations/mes-reservations`, {
    headers: authHeaders()
  })
  return res.json()
}

export const confirmerReservation = async (id) => {
  const res = await fetch(`${API_URL}/reservations/${id}/confirmer`, {
    method: 'PATCH',
    headers: authHeaders()
  })
  return res.json()
}

export const annulerReservation = async (id) => {
  const res = await fetch(`${API_URL}/reservations/${id}/annuler`, {
    method: 'PATCH',
    headers: authHeaders()
  })
  return res.json()
}

// ── COLIS ──
export const creerColis = async (data) => {
  const res = await fetch(`${API_URL}/colis`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(data)
  })
  return res.json()
}

export const getMesColis = async () => {
  const res = await fetch(`${API_URL}/colis/mes-colis`, {
    headers: authHeaders()
  })
  return res.json()
}

export const suivreColisOTP = async (otp) => {
  const res = await fetch(`${API_URL}/colis/suivi/${otp}`)
  return res.json()
}

export const validerLivraisonOTP = async (otp) => {
  const res = await fetch(`${API_URL}/colis/valider/${otp}`, {
    method: 'PATCH',
    headers: authHeaders()
  })
  return res.json()
}

// ── NÉGOCIATIONS ──
export const creerNegociation = async (data) => {
  const res = await fetch(`${API_URL}/negociations`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(data)
  })
  return res.json()
}

export const getMesNegociations = async () => {
  const res = await fetch(`${API_URL}/negociations/mes-negociations`, {
    headers: authHeaders()
  })
  return res.json()
}

export const repondreNegociation = async (id, decision, offreConducteur) => {
  const params = new URLSearchParams({ decision })
  if (offreConducteur) params.append('offreConducteur', offreConducteur)
  const res = await fetch(`${API_URL}/negociations/${id}/repondre?${params}`, {
    method: 'PATCH',
    headers: authHeaders()
  })
  return res.json()
}

// ── ADMIN ──
export const getStats = async () => {
  const res = await fetch(`${API_URL}/admin/stats`, {
    headers: authHeaders()
  })
  return res.json()
}

export const getAllUtilisateurs = async () => {
  const res = await fetch(`${API_URL}/admin/utilisateurs`, {
    headers: authHeaders()
  })
  return res.json()
}

export const bloquerUtilisateur = async (id) => {
  const res = await fetch(`${API_URL}/admin/utilisateurs/${id}/bloquer`, {
    method: 'PATCH',
    headers: authHeaders()
  })
  return res.ok
}
export const debloquerUtilisateur = async (id) => {
  const res = await fetch(`${API_URL}/admin/utilisateurs/${id}/debloquer`, {
    method: 'PATCH',
    headers: authHeaders()
  })
  return res.ok
}
// ── ÉVALUATIONS ──
export const evaluerUtilisateur = async (data) => {
  const res = await fetch(`${API_URL}/evaluations`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(data)
  })
  return res.json()
}

export const getEvaluations = async (userId) => {
  const res = await fetch(`${API_URL}/evaluations/utilisateur/${userId}`, {
    headers: authHeaders()
  })
  return res.json()
}

// ── DOCUMENTS ──
export const uploadDocuments = async (formData) => {
  const res = await fetch(`${API_URL}/documents/upload`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${getToken()}`
      // Ne pas mettre Content-Type ici — le browser le fait automatiquement pour FormData
    },
    body: formData
  })
  if (!res.ok) throw new Error('Erreur upload')
  return res.text()
}

export const getDocumentsEnAttente = async () => {
  const res = await fetch(`${API_URL}/documents/en-attente`, {
    headers: authHeaders()
  })
  return res.json()
}

export const validerDocument = async (id) => {
  const res = await fetch(`${API_URL}/documents/${id}/valider`, {
    method: 'PATCH',
    headers: authHeaders()
  })
  return res.ok
}

export const rejeterDocument = async (id) => {
  const res = await fetch(`${API_URL}/documents/${id}/rejeter`, {
    method: 'PATCH',
    headers: authHeaders()
  })
  return res.ok
}

// ── LITIGES ──
export const creerLitige = async (data) => {
  const res = await fetch(`${API_URL}/litiges`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(data)
  })
  return res.json()
}

export const getLitiges = async () => {
  const res = await fetch(`${API_URL}/litiges`, {
    headers: authHeaders()
  })
  return res.json()
}

export const resoudreLitige = async (id) => {
  const res = await fetch(`${API_URL}/litiges/${id}/resoudre`, {
    method: 'PATCH',
    headers: authHeaders()
  })
  return res.json()
}

export const mettreEnCoursLitige = async (id) => {
  const res = await fetch(`${API_URL}/litiges/${id}/en-cours`, {
    method: 'PATCH',
    headers: authHeaders()
  })
  return res.json()
}