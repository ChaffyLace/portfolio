import { useState, useEffect } from 'react'
import './ConfirmModal.css'

export default function EditProductModal({ isOpen, product, onSave, onCancel }) {
  const [form, setForm] = useState({ sku: '', name: '', alert_threshold: '' })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (product) setForm({ sku: product.sku, name: product.name, alert_threshold: product.alert_threshold })
  }, [product])

  if (!isOpen || !product) return null

  function handleChange(e) { setForm(f => ({ ...f, [e.target.name]: e.target.value })) }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    await onSave(product.id, { sku: form.sku, name: form.name, alert_threshold: parseInt(form.alert_threshold) })
    setSaving(false)
  }

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-box" onClick={e => e.stopPropagation()} style={{ textAlign: 'left' }}>
        <h2 className="modal-title" style={{ textAlign: 'center' }}>✏️ Modifier le produit</h2>
        <p className="modal-message" style={{ textAlign: 'center' }}>Modifiez les informations du produit</p>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="field">
            <label className="field__label">Code SKU</label>
            <input name="sku" type="text" className="field__input" value={form.sku} onChange={handleChange} required />
          </div>
          <div className="field">
            <label className="field__label">Nom du produit</label>
            <input name="name" type="text" className="field__input" value={form.name} onChange={handleChange} required />
          </div>
          <div className="field">
            <label className="field__label">Seuil d'alerte</label>
            <input name="alert_threshold" type="number" min="0" className="field__input" value={form.alert_threshold} onChange={handleChange} required />
          </div>
          <div className="modal-actions" style={{ marginTop: 8 }}>
            <button type="button" className="btn btn--secondary" onClick={onCancel}>Annuler</button>
            <button type="submit" className="btn btn--primary" disabled={saving}>{saving ? 'Enregistrement…' : 'Enregistrer'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}