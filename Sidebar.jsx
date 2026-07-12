const API_URL = 'http://localhost:8000/api';

const fetchWithAuth = async (endpoint, options = {}) => {
  const token = localStorage.getItem('sf_token');
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let detail = 'Erreur API';
    try {
      const errData = await response.json();
      detail = errData.detail || detail;
    } catch {}
    throw new Error(detail);
  }

  return response.json();
};

export const login = async (email, password) => {
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

export const deleteProduct = async (productId) => {
  return fetchWithAuth(`/products/${productId}`, { 
    method: 'DELETE' 
  });
};

export const getMovements = async () => {
  return fetchWithAuth('/movements', { 
    method: 'GET' 
  });
};

export const addMovement = async (product_id, movementData) => {
  return fetchWithAuth(`/movements/${product_id}`, {
    method: 'POST',
    body: JSON.stringify(movementData)
  });
};