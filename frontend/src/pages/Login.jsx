import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './Auth.css'

const MAX_ATTEMPTS = 5

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [attempts, setAttempts] = useState(0)

  function handleChange(e) { setForm(f => ({ ...f, [e.target.name]: e.target.value })) }

  async function handleSubmit(e) {
    e.preventDefault(); setError(''); setLoading(true)
    try { await login(form.email, form.password); navigate('/dashboard') }
    catch (err) {
      const msg = err.response?.data?.detail || err.message || 'Identifiants incorrects'
      const n = attempts + 1; setAttempts(n)
      if (msg.toLowerCase().includes('bloqu')) { setError(msg) }
      else { const r = MAX_ATTEMPTS - n; setError(r > 0 ? `Identifiants incorrects — ${r} tentative(s) restante(s) avant blocage.` : 'Trop de tentatives. Compte bloqué pendant 15 minutes.') }
    } finally { setLoading(false) }
  }

  const isBlocked = error.toLowerCase().includes('bloqu')

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-brand"><span className="auth-logo">SF</span><span className="auth-appname">StockFlow</span></div>
        <h1 className="auth-heading">Connexion</h1>
        <p className="auth-sub">Accédez à votre espace de gestion de stock</p>
        {error && <div key={error} className={`auth-error ${isBlocked ? 'auth-error--blocked' : ''}`}>{isBlocked && <span style={{ marginRight:6 }}>🔒</span>}{error}</div>}
        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="field"><label className="field__label">Email</label><input name="email" type="email" className="field__input" placeholder="vous@example.com" value={form.email} onChange={handleChange} required autoComplete="email" disabled={isBlocked} /></div>
          <div className="field"><label className="field__label">Mot de passe</label><input name="password" type="password" className="field__input" placeholder="••••••••" value={form.password} onChange={handleChange} required autoComplete="current-password" disabled={isBlocked} /></div>
          <button className="btn btn--primary btn--full" type="submit" disabled={loading || isBlocked}>{loading ? 'Connexion…' : isBlocked ? '🔒 Compte bloqué' : 'Se connecter'}</button>
        </form>
        <p className="auth-switch">Pas encore de compte ? <Link to="/register">Créer un compte</Link></p>
      </div>
    </div>
  )
}