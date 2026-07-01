import { useEffect, useState } from 'react'
import { getProducts, addMovement } from '../api'
import { useAuth } from '../context/AuthContext'
import Layout from '../components/Layout'
import './Dashboard.css'
import './Products.css'
import './Movements.css'

const EMPTY_FORM = { product_id: '', quantity_changed: '', reason: '' }

export default function Movements() {
  const { user } = useAuth()
  const [products, setProducts] = useState([])
  const [loadingProducts, setLoadingProducts] = useState(true)

  const [form, setForm] = useState(EMPTY_FORM)
  const [formError, setFormError] = useState('')
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState('')

  useEffect(() => {
    getProducts()
      .then(res => setProducts(res.data ?? []))
      .finally(() => setLoadingProducts(false))
  }, [])

  function handleChange(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setFormError('')
    setSaving(true)
    try {
      const productId = parseInt(form.product_id)
      await addMovement(productId, {
        user_id: user?.id ?? 1,
        quantity_changed: parseInt(form.quantity_changed),
        reason: form.reason
      })
      const product = products.find(p => p.id === productId)
      const qty = parseInt(form.quantity_changed)
      const dir = qty > 0 ? `+${qty} unité(s) ajoutée(s)` : `${qty} unité(s) retirée(s)`
      setSuccess(`Mouvement enregistré — ${dir} sur « ${product?.name ?? 'produit'} »`)
      setForm(EMPTY_FORM)
      setTimeout(() => setSuccess(''), 5000)
      getProducts().then(res => setProducts(res.data ?? []))
    } catch (err) {
      setFormError(err.message || "Erreur lors de l'enregistrement")
    } finally {
      setSaving(false)
    }
  }

  const selectedProduct = products.find(p => p.id === parseInt(form.product_id))

  return (
    <Layout>
      <div className="page-header">
        <div>
          <h1 className="page-title">Mouvements de stock</h1>
          <p className="page-sub">Enregistrez une entrée ou sortie de stock</p>
        </div>
      </div>

      {success && <div className="page-success">{success}</div>}

      <div className="movements-grid">
        <section className="section">
          <div className="section-header">
            <h2 className="section-title">Nouveau mouvement</h2>
          </div>
          <div className="form-body">
            {formError && <div className="page-error">{formError}</div>}
            <form className="movement-form" onSubmit={handleSubmit}>
              <div className="field">
                <label className="field__label" htmlFor="product_id">Produit</label>
                <select
                  id="product_id" name="product_id"
                  className="field__input"
                  value={form.product_id}
                  onChange={handleChange}
                  required
                  disabled={loadingProducts}
                >
                  <option value="">-- Sélectionner un produit --</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.sku}) — stock: {p.quantity}
                    </option>
                  ))}
                </select>
              </div>

              <div className="field">
                <label className="field__label" htmlFor="quantity_changed">
                  Quantité (+ entrée / − sortie)
                </label>
                <input
                  id="quantity_changed" name="quantity_changed" type="number"
                  className="field__input" placeholder="Ex: -3 ou +10"
                  value={form.quantity_changed} onChange={handleChange} required
                />
              </div>

              <div className="field">
                <label className="field__label" htmlFor="reason">Motif</label>
                <input
                  id="reason" name="reason" type="text"
                  className="field__input" placeholder="Vente client, réapprovisionnement…"
                  value={form.reason} onChange={handleChange} required
                />
              </div>

              <button className="btn btn--primary" type="submit" disabled={saving || loadingProducts}>
                {saving ? 'Enregistrement…' : 'Enregistrer le mouvement'}
              </button>
            </form>
          </div>
        </section>

        <section className="section movement-preview">
          <div className="section-header">
            <h2 className="section-title">Aperçu produit</h2>
          </div>
          <div className="preview-body">
            {!selectedProduct ? (
              <div className="empty-state">Sélectionnez un produit pour voir son état</div>
            ) : (
              <div className="product-info">
                <div className="product-info__row">
                  <span className="product-info__key">SKU</span>
                  <span className="product-info__val mono">{selectedProduct.sku}</span>
                </div>
                <div className="product-info__row">
                  <span className="product-info__key">Nom</span>
                  <span className="product-info__val">{selectedProduct.name}</span>
                </div>
                <div className="product-info__row">
                  <span className="product-info__key">Stock actuel</span>
                  <span className="product-info__val mono big">{selectedProduct.quantity}</span>
                </div>
                <div className="product-info__row">
                  <span className="product-info__key">Seuil d'alerte</span>
                  <span className="product-info__val mono">{selectedProduct.alert_threshold}</span>
                </div>
                {form.quantity_changed !== '' && !isNaN(parseInt(form.quantity_changed)) && (
                  <div className="product-info__row product-info__row--preview">
                    <span className="product-info__key">Stock après mouvement</span>
                    <span className="product-info__val mono big">
                      {selectedProduct.quantity + parseInt(form.quantity_changed)}
                    </span>
                  </div>
                )}
                <div className="product-info__status">
                  {selectedProduct.quantity === 0
                    ? <span className="badge badge--danger">Rupture</span>
                    : selectedProduct.quantity <= selectedProduct.alert_threshold
                    ? <span className="badge badge--warn">Alerte seuil</span>
                    : <span className="badge badge--success">Stock OK</span>}
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </Layout>
  )
}