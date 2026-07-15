const API_URL = 'http://localhost:8000/api';

// Fonction utilitaire pour ajouter le token automatiquement à tes requêtes
const fetchWithAuth = async (endpoint, options = {}) => {
  const token = localStorage.getItem('sf_token');
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  // Si on a un token, on l'ajoute dans les headers
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  // Gestion basique des erreurs
  if (!response.ok) {
    throw new Error(`Erreur API (Code: ${response.status})`);
  }

  // Si c'est une suppression (code 204), il n'y a pas de JSON à lire
  if (response.status === 204) {
    return null;
  }

  return response.json();
};

// ==========================================
// AUTHENTIFICATION
// ==========================================

export const login = async (email, password) => {
  // Le backend attend un format formulaire classique pour le login
  const formData = new URLSearchParams();
  formData.append('username', email);
  formData.append('password', password);

  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: formData
  });

  if (!response.ok) throw new Error('Identifiants incorrects');
  return response.json();
};

export const registerCompany = async (companyData) => {
  return fetchWithAuth('/auth/register-company', {
    method: 'POST',
    body: JSON.stringify(companyData)
  });
};

export const register = async (userData) => {
  return fetchWithAuth('/auth/register', {
    method: 'POST',
    body: JSON.stringify(userData)
  });
};

// ==========================================
// PRODUITS
// ==========================================

export const getProducts = async () => {
  return fetchWithAuth('/products', { 
    method: 'GET' 
  });
};

export const createProduct = async (productData) => {
  return fetchWithAuth('/products', {
    method: 'POST',
    body: JSON.stringify(productData)
  });
};

// Correction : on utilise fetchWithAuth au lieu de api.put !
export const updateProduct = async (productId, data) => {
  return fetchWithAuth(`/products/${productId}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  });
};

export const deleteProduct = async (productId) => {
  return fetchWithAuth(`/products/${productId}`, { 
    method: 'DELETE' 
  });
};

// ==========================================
// MOUVEMENTS DE STOCK
// ==========================================

export const getMovements = async () => {
  return fetchWithAuth('/movements', { 
    method: 'GET' 
  });
};

export const addMovement = async (productId, movementData) => {
  return fetchWithAuth(`/movements/${productId}`, {
    method: 'POST',
    body: JSON.stringify(movementData)
  });
};