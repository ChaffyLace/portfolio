import { useEffect, useState } from 'react'
import { getProducts, createProduct } from '../api'
import Layout from '../components/Layout'
import './Dashboard.css'
import './Products.css'

const EMPTY_FORM = { sku: '', name: '', quantity: '', alert_threshold: '' }

export default function Products() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [formError, setFormError] = useState('')
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState('')

  function load() {
    setLoading(true)
    getProducts()
      .then(res => setProducts(res.data.data ?? []))
      .catch(() => setError('Impossible de charger les produits'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  function handleChange(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setFormError('')
    setSaving(true)
    try {
      await createProduct(
        form.sku,
        form.name,
        parseInt(form.quantity),
        parseInt(form.alert_threshold)
      )
      setSuccess('Produit créé avec succès')
      setForm(EMPTY_FORM)
      setShowForm(false)
      load()
      setTimeout(() => setSuccess(''), 4000)
    } catch (err) {
      setFormError(err.response?.data?.detail || 'Erreur lors de la création')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Layout>
      <div className="page-header">
        <div>
          <h1 className="page-title">Produits</h1>
          <p className="page-sub">{products.length} référence(s) en stock</p>
        </div>
        <button
          className="btn btn--primary btn--sm"
          onClick={() => { setShowForm(s => !s); setFormError('') }}
        >
          {showForm ? '✕ Annuler' : '+ Nouveau produit'}
        </button>
      </div>

      {success && <div className="page-success">{success}</div>}

      {showForm && (
        <section className="section section--form">
          <div className="section-header">
            <h2 className="section-title">Nouveau produit</h2>
          </div>
          <div className="form-body">
            {formError && <div className="page-error">{formError}</div>}
            <form className="product-form" onSubmit={handleSubmit}>
              <div className="field">
                <label className="field__label" htmlFor="sku">SKU</label>
                <input
                  id="sku" name="sku" type="text"
                  className="field__input" placeholder="MAC-BK-M3"
                  value={form.sku} onChange={handleChange} required
                />
              </div>
              <div className="field">
                <label className="field__label" htmlFor="name">Nom du produit</label>
                <input
                  id="name" name="name" type="text"
                  className="field__input" placeholder="MacBook Air M3"
                  value={form.name} onChange={handleChange} required
                />
              </div>
              <div className="field">
                <label className="field__label" htmlFor="quantity">Quantité initiale</label>
                <input
                  id="quantity" name="quantity" type="number" min="0"
                  className="field__input" placeholder="15"
                  value={form.quantity} onChange={handleChange} required
                />
              </div>
              <div className="field">
                <label className="field__label" htmlFor="alert_threshold">Seuil d'alerte</label>
                <input
                  id="alert_threshold" name="alert_threshold" type="number" min="0"
                  className="field__input" placeholder="5"
                  value={form.alert_threshold} onChange={handleChange} required
                />
              </div>
              <button className="btn btn--primary" type="submit" disabled={saving}>
                {saving ? 'Création…' : 'Créer le produit'}
              </button>
            </form>
          </div>
        </section>
      )}

      <section className="section">
        <div className="section-header">
          <h2 className="section-title">Inventaire complet</h2>
        </div>
        {loading ? (
          <div className="loading">Chargement…</div>
        ) : products.length === 0 ? (
          <div className="empty-state">Aucun produit référencé pour l'instant</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>SKU</th>
                <th>Nom</th>
                <th>Quantité</th>
                <th>Seuil</th>
                <th>Statut</th>
              </tr>
            </thead>
            <tbody>
              {products.map(p => {
                const status = p.quantity === 0 ? 'danger'
                  : p.quantity <= p.alert_threshold ? 'warn'
                  : 'ok'
                return (
                  <tr key={p.id}>
                    <td className="mono td-sku">{p.sku}</td>
                    <td className="td-name">{p.name}</td>
                    <td className="mono">{p.quantity}</td>
                    <td className="mono">{p.alert_threshold}</td>
                    <td>
                      {status === 'danger' && <span className="badge badge--danger">Rupture</span>}
                      {status === 'warn'   && <span className="badge badge--warn">Alerte</span>}
                      {status === 'ok'     && <span className="badge badge--success">OK</span>}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </section>
    </Layout>
  )
}
