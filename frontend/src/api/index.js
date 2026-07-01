const API_URL = 'http://localhost:8000/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('sf_token');
  const headers = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;

  try {
    const user = JSON.parse(localStorage.getItem('sf_user'));
    if (user?.id) headers['x-user-id'] = user.id;
  } catch {
  }

  return headers;
};

export const login = async (email, password) => {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ email, password })
  });

  if (!response.ok) throw new Error('Identifiants incorrects');
  return response.json();
};

export const register = async (userData) => {
  const response = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData)
  });

  if (!response.ok) throw new Error('Erreur lors de la création du compte');
  return response.json();
};

export const getProducts = async () => {
  const response = await fetch(`${API_URL}/products`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders()
    }
  });

  if (!response.ok) throw new Error('Erreur lors de la récupération des produits');
  return response.json();
};

export const createProduct = async (productData) => {
  const response = await fetch(`${API_URL}/products`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders()
    },
    body: JSON.stringify(productData)
  });

  if (!response.ok) {
    let detail = 'Erreur lors de la création du produit';
    try {
      const errData = await response.json();
      detail = errData.detail || detail;
    } catch {
    }
    throw new Error(detail);
  }
  return response.json();
};

export const getMovements = async () => {
  const response = await fetch(`${API_URL}/movements`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders()
    }
  });

  if (!response.ok) throw new Error('Erreur lors de la récupération des mouvements');
  return response.json();
};

export const addMovement = async (product_id, movementData) => {
  const response = await fetch(`${API_URL}/movements/${product_id}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders()
    },
    body: JSON.stringify(movementData)
  });

  if (!response.ok) {
    let detail = 'Erreur lors de la création du mouvement';
    try {
      const errData = await response.json();
      detail = errData.detail || detail;
    } catch {
    }
    throw new Error(detail);
  }
  return response.json();
};