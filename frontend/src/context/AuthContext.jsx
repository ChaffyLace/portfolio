import { createContext, useContext, useState } from 'react'
import { login as apiLogin, register as apiRegister } from '../api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('sf_user')) } catch { return null }
  })

  async function login(email, password) {
    const { data } = await apiLogin(email, password)
    const u = data.user
    setUser(u)
    localStorage.setItem('sf_user', JSON.stringify(u))
    if (u.token) localStorage.setItem('sf_token', u.token)
    return u
  }

  async function register(name, email, password, role) {
    await apiRegister(name, email, password, role)
  }

  function logout() {
    setUser(null)
    localStorage.removeItem('sf_user')
    localStorage.removeItem('sf_token')
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
