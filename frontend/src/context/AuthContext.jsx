import { createContext, useContext, useState, useEffect } from 'react';
import { login as apiLogin, registerCompany as apiRegisterCompany, register as apiRegister } from '../api/index.js';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('sf_token');
    const savedUser = localStorage.getItem('sf_user');
    if (token) {
      setIsAuthenticated(true);
      if (savedUser) {
        try {
          setUser(JSON.parse(savedUser));
        } catch {
          setUser(null);
        }
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const data = await apiLogin(email, password);
      const token = data.access_token;
      const userData = data.user;

      if (token) {
        localStorage.setItem('sf_token', token);
        localStorage.setItem('sf_user', JSON.stringify(userData));
        setUser(userData);
        setIsAuthenticated(true);
        return true;
      }
      return false;
    } catch (error) {
      throw error;
    }
  };

  const registerCompany = async (companyData) => {
    try {
      return await apiRegisterCompany(companyData);
    } catch (error) {
      throw error;
    }
  };

  const register = async (userData) => {
    try {
      return await apiRegister(userData);
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('sf_token');
    localStorage.removeItem('sf_user');
    setIsAuthenticated(false);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, registerCompany, register, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};