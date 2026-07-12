import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
  headers: { 'Content-Type': 'application/json' },
})

// ── Auth ─────────────────────────────────────────────────
export const login = (email, password) =>
  api.post('/auth/login', { email, password })

export const register = (name, email, password, role = 'user') =>
  api.post('/auth/register', { name, email, password, role })

// ── Produits ─────────────────────────────────────────────
export const getProducts = () =>
  api.get('/products')

// createProduct envoie l'id de l'utilisateur dans le header x-user-id
// requis par le backend pour vérifier que c'est un admin
export const createProduct = (sku, name, quantity, alert_threshold, userId) =>
  api.post('/products', { sku, name, quantity, alert_threshold }, {
    headers: { 'x-user-id': userId }
  })

export const getAlerts = () =>
  api.get('/products/alerts')

// ── Mouvements ───────────────────────────────────────────
export const addMovement = (product_id, user_id, quantity_changed, reason) =>
  api.post(`/movements/${product_id}`, { user_id, quantity_changed, reason })

export const getMovements = (product_id = null) => {
  const params = product_id ? { product_id } : {}
  return api.get('/movements', { params })
}

export default api
