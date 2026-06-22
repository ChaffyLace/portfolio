const API_URL = 'http://localhost:8000/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};

export const api = {
  login: async (email, password) => {
    // Note : Format URLSearchParams pour être compatible avec OAuth2 de FastAPI
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ username: email, password: password }) 
    });
    
    if (!response.ok) throw new Error('Identifiants incorrects');
    return response.json();
  },

  register: async (userData) => {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    
    if (!response.ok) throw new Error('Erreur lors de la création du compte');
    return response.json();
  },
  
  getProducts: async () => {
    const response = await fetch(`${API_URL}/products`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      }
    });
    
    if (!response.ok) throw new Error('Erreur lors de la récupération des produits');
    return response.json();
  },
  
  getMovements: async () => {
    const response = await fetch(`${API_URL}/movements`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      }
    });
    
    if (!response.ok) throw new Error('Erreur lors de la récupération des mouvements');
    return response.json();
  }
};