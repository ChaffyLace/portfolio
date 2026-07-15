import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import Layout from '../components/Layout'
import './Auth.css'
import './Products.css'

export default function InviteUser() {
  const { register, user } = useAuth()
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'user' })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  if (user?.role !== 'admin') return <Layout><div className="page-error">Accès réservé aux administrateurs.</div></Layout>

  function handleChange(e) { setForm(f => ({ ...f, [e.target.name]: e.target.value })) }

  async function handleSubmit(e) {
    e.preventDefault(); setError(''); setSuccess(''); setLoading(true)
    try {
      await register({ name: form.name, email: form.email, password: form.password, role: form.role })
      setSuccess(`Utilisateur ${form.name} créé avec succès.`)
      setForm({ name: '', email: '', password: '', role: 'user' })
      setTimeout(() => setSuccess(''), 5000)
    } catch (err) {
      setError(err.response?.data?.detail || err.message || "Erreur lors de la création de l'utilisateur")
    } finally { setLoading(false) }
  }

  return (
    <Layout>
      <div className="page-header">
        <div>
          <h1 className="page-title">Inviter un utilisateur</h1>
          <p className="page-sub">Ajoutez un membre à votre organisation</p>
        </div>
      </div>
      {success && <div className="page-success">{success}</div>}
      <section className="section" style={{ maxWidth: 480 }}>
        <div className="form-body">
          {error && <div className="page-error">{error}</div>}
          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="field">
              <label className="field__label">Nom complet</label>
              <input name="name" type="text" className="field__input" placeholder="Jean Dupont" value={form.name} onChange={handleChange} required />
            </div>
            <div className="field">
              <label className="field__label">Email</label>
              <input name="email" type="email" className="field__input" placeholder="jean@exemple.com" value={form.email} onChange={handleChange} required autoComplete="email" />
            </div>
            <div className="field">
              <label className="field__label">Mot de passe temporaire</label>
              <input name="password" type="password" className="field__input" placeholder="••••••••" value={form.password} onChange={handleChange} required autoComplete="new-password" />
            </div>
            <div className="field">
              <label className="field__label">Rôle</label>
              <select name="role" className="field__input" value={form.role} onChange={handleChange}>
                <option value="user">Utilisateur</option>
                <option value="admin">Administrateur</option>
              </select>
            </div>
            <button className="btn btn--primary btn--full" type="submit" disabled={loading}>
              {loading ? 'Création…' : 'Créer le compte'}
            </button>
          </form>
        </div>
      </section>
    </Layout>
  )
}