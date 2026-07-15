import { useEffect, useState } from 'react'
import { getProducts, addMovement } from '../api'
import { useAuth } from '../context/AuthContext'
import Layout from '../components/Layout'
import './Dashboard.css'
import './Products.css'
import './Movements.css'

const EMPTY = { product_id: '', quantity_changed: '', reason: '' }

export default function Movements() {
  const { user } = useAuth()
  const [products, setProducts] = useState([])
  const [loadingP, setLoadingP] = useState(true)
  const [form, setForm] = useState(EMPTY)
  const [formError, setFormError] = useState('')
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState('')

  useEffect(() => {
    getProducts().then(r => setProducts(r.data ?? [])).finally(() => setLoadingP(false))
  }, [])

  function handleChange(e) { setForm(f => ({ ...f, [e.target.name]: e.target.value })) }

  async function handleSubmit(e) {
    e.preventDefault(); setFormError(''); setSaving(true)
    try {
      const id = parseInt(form.product_id)
      await addMovement(id, { user_id: user?.id ?? 1, quantity_changed: parseInt(form.quantity_changed), reason: form.reason })
      const p = products.find(p => p.id === id)
      const qty = parseInt(form.quantity_changed)
      setSuccess(`Mouvement enregistré — ${qty > 0 ? '+'+qty : qty} unité(s) sur « ${p?.name ?? 'produit'} »`)
      setForm(EMPTY)
      setTimeout(() => setSuccess(''), 5000)
      getProducts().then(r => setProducts(r.data ?? []))
    } catch (err) { setFormError(err.message || "Erreur lors de l'enregistrement") }
    finally { setSaving(false) }
  }

  const sel = products.find(p => p.id === parseInt(form.product_id))

  return (
    <Layout>
      <div className="page-header"><div><h1 className="page-title">Mouvements de stock</h1><p className="page-sub">Enregistrez une entrée ou sortie de stock</p></div></div>
      {success && <div className="page-success">{success}</div>}
      <div className="movements-grid">
        <section className="section">
          <div className="section-header"><h2 className="section-title">Nouveau mouvement</h2></div>
          <div className="form-body">
            {formError && <div className="page-error">{formError}</div>}
            <form className="movement-form" onSubmit={handleSubmit}>
              <div className="field">
                <label className="field__label">Produit</label>
                <select name="product_id" className="field__input" value={form.product_id} onChange={handleChange} required disabled={loadingP}>
                  <option value="">-- Sélectionner un produit --</option>
                  {products.map(p => <option key={p.id} value={p.id}>{p.name} ({p.sku}) — stock: {p.quantity}</option>)}
                </select>
              </div>
              <div className="field">
                <label className="field__label">Quantité (+ entrée / − sortie)</label>
                <input name="quantity_changed" type="number" className="field__input" placeholder="Ex: -3 ou +10" value={form.quantity_changed} onChange={handleChange} required />
              </div>
              <div className="field">
                <label className="field__label">Motif</label>
                <input name="reason" type="text" className="field__input" placeholder="Vente client, réapprovisionnement…" value={form.reason} onChange={handleChange} required />
              </div>
              <button className="btn btn--primary" type="submit" disabled={saving || loadingP}>{saving ? 'Enregistrement…' : 'Enregistrer le mouvement'}</button>
            </form>
          </div>
        </section>
        <section className="section movement-preview">
          <div className="section-header"><h2 className="section-title">Aperçu produit</h2></div>
          <div className="preview-body">
            {!sel ? <div className="empty-state">Sélectionnez un produit pour voir son état</div> : (
              <div className="product-info">
                <div className="product-info__row"><span className="product-info__key">SKU</span><span className="product-info__val mono">{sel.sku}</span></div>
                <div className="product-info__row"><span className="product-info__key">Nom</span><span className="product-info__val">{sel.name}</span></div>
                <div className="product-info__row"><span className="product-info__key">Stock actuel</span><span className="product-info__val mono big">{sel.quantity}</span></div>
                <div className="product-info__row"><span className="product-info__key">Seuil d'alerte</span><span className="product-info__val mono">{sel.alert_threshold}</span></div>
                {form.quantity_changed !== '' && !isNaN(parseInt(form.quantity_changed)) && (
                  <div className="product-info__row product-info__row--preview">
                    <span className="product-info__key">Stock après mouvement</span>
                    <span className="product-info__val mono big">{sel.quantity + parseInt(form.quantity_changed)}</span>
                  </div>
                )}
                <div className="product-info__status">
                  {sel.quantity === 0 ? <span className="badge badge--danger">Rupture</span>
                    : sel.quantity <= sel.alert_threshold ? <span className="badge badge--warn">Alerte seuil</span>
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