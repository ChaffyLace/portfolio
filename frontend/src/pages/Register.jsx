import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './Auth.css'

export default function Register() {
  const { registerCompany } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ company_name: '', admin_name: '', admin_email: '', admin_password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function handleChange(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await registerCompany(form)
      navigate('/login')
    } catch (err) {
      setError(err.message || 'Erreur lors de la création du compte')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-brand">
          <span className="auth-logo">SF</span>
          <span className="auth-appname">StockFlow</span>
        </div>
        <h1 className="auth-heading">Créer une entreprise</h1>
        <p className="auth-sub">Inscrivez votre organisation pour commencer</p>

        {error && <div className="auth-error">{error}</div>}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="field">
            <label className="field__label" htmlFor="company_name">Nom de l'entreprise</label>
            <input
              id="company_name"
              name="company_name"
              type="text"
              className="field__input"
              placeholder="Ma Super Boîte"
              value={form.company_name}
              onChange={handleChange}
              required
            />
          </div>
          <div className="field">
            <label className="field__label" htmlFor="admin_name">Votre nom (Admin)</label>
            <input
              id="admin_name"
              name="admin_name"
              type="text"
              className="field__input"
              placeholder="Jean Dupont"
              value={form.admin_name}
              onChange={handleChange}
              required
              autoComplete="name"
            />
          </div>
          <div className="field">
            <label className="field__label" htmlFor="admin_email">Email professionnel</label>
            <input
              id="admin_email"
              name="admin_email"
              type="email"
              className="field__input"
              placeholder="jean@masuperboite.com"
              value={form.admin_email}
              onChange={handleChange}
              required
              autoComplete="email"
            />
          </div>
          <div className="field">
            <label className="field__label" htmlFor="admin_password">Mot de passe</label>
            <input
              id="admin_password"
              name="admin_password"
              type="password"
              className="field__input"
              placeholder="••••••••"
              value={form.admin_password}
              onChange={handleChange}
              required
              autoComplete="new-password"
            />
          </div>
          <button className="btn btn--primary btn--full" type="submit" disabled={loading}>
            {loading ? 'Création…' : "Créer l'espace entreprise"}
          </button>
        </form>

        <p className="auth-switch">
          Déjà un compte ? <Link to="/login">Se connecter</Link>
        </p>
      </div>
    </div>
  )
}