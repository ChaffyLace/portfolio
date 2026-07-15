import { useEffect, useState, useMemo } from 'react'
import { getProducts, createProduct, deleteProduct, updateProduct } from '../api'
import { useAuth } from '../context/AuthContext'
import Layout from '../components/Layout'
import ConfirmModal from '../components/ConfirmModal'
import EditProductModal from '../components/EditProductModal'
import * as XLSX from 'xlsx'
import './Dashboard.css'
import './Products.css'

const EMPTY_FORM = { sku: '', name: '', quantity: '', alert_threshold: '' }

const StarIcon = ({ filled }) => (
  <svg viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
)

const DownloadIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
  </svg>
)

const EditIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
)

const TrashIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
  </svg>
)

export default function Products() {
  const { user } = useAuth()
  const [products, setProducts]   = useState([])
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState('')
  const [showForm, setShowForm]   = useState(false)
  const [form, setForm]           = useState(EMPTY_FORM)
  const [formError, setFormError] = useState('')
  const [saving, setSaving]       = useState(false)
  const [success, setSuccess]     = useState('')
  const [search, setSearch]       = useState('')
  const [showFavOnly, setShowFavOnly] = useState(false)
  const [favorites, setFavorites] = useState(() => {
    try { return JSON.parse(localStorage.getItem('sf_favorites') || '[]') } catch { return [] }
  })
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, productId: null })
  const [editModal, setEditModal]       = useState({ isOpen: false, product: null })

  const isAdmin = user?.role === 'admin'

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true); setError('')
    try { const r = await getProducts(); setProducts(r.data ?? []) }
    catch { setError('Impossible de charger les produits.') }
    finally { setLoading(false) }
  }

  const filtered = useMemo(() => {
    let list = showFavOnly ? products.filter(p => favorites.includes(p.id)) : products
    return list.filter(p =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase())
    )
  }, [products, search, favorites, showFavOnly])

  function toggleFav(id) {
    const next = favorites.includes(id) ? favorites.filter(f => f !== id) : [...favorites, id]
    setFavorites(next)
    localStorage.setItem('sf_favorites', JSON.stringify(next))
  }

  function handleChange(e) { setForm(f => ({ ...f, [e.target.name]: e.target.value })) }

  async function handleSubmit(e) {
    e.preventDefault(); setFormError(''); setSaving(true)
    try {
      await createProduct({ sku: form.sku, name: form.name, quantity: parseInt(form.quantity), alert_threshold: parseInt(form.alert_threshold) })
      tmp('Produit créé avec succès'); setForm(EMPTY_FORM); setShowForm(false); load()
    } catch (err) { setFormError(err.message || 'Erreur') }
    finally { setSaving(false) }
  }

  function askDelete(id) { setConfirmModal({ isOpen: true, productId: id }) }
  async function confirmDelete() {
    try { await deleteProduct(confirmModal.productId); tmp('Produit supprimé'); load() }
    catch (err) { setError(err.message || 'Erreur') }
    finally { setConfirmModal({ isOpen: false, productId: null }) }
  }

  function openEdit(product) { setEditModal({ isOpen: true, product }) }
  async function handleSaveEdit(id, data) {
    try { await updateProduct(id, data); tmp('Produit modifié'); load(); setEditModal({ isOpen: false, product: null }) }
    catch (err) { setError(err.message || 'Erreur') }
  }

  function exportExcel() {
    const data = products.map(p => ({
      SKU: p.sku, Nom: p.name, Quantité: p.quantity,
      'Seuil alerte': p.alert_threshold,
      Statut: p.quantity === 0 ? 'Rupture' : p.quantity <= p.alert_threshold ? 'Alerte' : 'OK'
    }))
    const ws = XLSX.utils.json_to_sheet(data)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Inventaire')
    XLSX.writeFile(wb, `StockFlow_Inventaire_${new Date().toISOString().slice(0,10)}.xlsx`)
  }

  function tmp(msg) { setSuccess(msg); setTimeout(() => setSuccess(''), 4000) }

  return (
    <Layout>
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title="Supprimer le produit"
        message="Cette action est irréversible. Le produit et tout son historique seront supprimés définitivement."
        confirmLabel="Supprimer"
        danger
        onConfirm={confirmDelete}
        onCancel={() => setConfirmModal({ isOpen: false, productId: null })}
      />
      <EditProductModal
        isOpen={editModal.isOpen}
        product={editModal.product}
        onSave={handleSaveEdit}
        onCancel={() => setEditModal({ isOpen: false, product: null })}
      />

      <div className="page-header">
        <div>
          <h1 className="page-title">Inventaire des produits</h1>
          <p className="page-sub">{filtered.length} référence(s) trouvée(s)</p>
        </div>
        <div className="products-toolbar">
          <button className="btn btn--secondary btn--sm" onClick={exportExcel} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <DownloadIcon /> Export Excel
          </button>
          <button className={`btn btn--sm ${showFavOnly ? 'btn--primary' : 'btn--secondary'}`} onClick={() => setShowFavOnly(f => !f)} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill={showFavOnly ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
            {showFavOnly ? 'Tous' : 'Favoris'}
          </button>
          {isAdmin && (
            <button className="btn btn--primary btn--sm" onClick={() => { setShowForm(p => !p); setFormError('') }}>
              {showForm ? '✕ Annuler' : '+ Nouveau produit'}
            </button>
          )}
        </div>
      </div>

      {success && <div className="page-success">{success}</div>}
      {error   && <div className="page-error">{error}</div>}

      {showForm && isAdmin && (
        <section className="section section--form">
          <div className="section-header"><h2 className="section-title">Nouveau produit</h2></div>
          <div className="form-body">
            {formError && <div className="page-error">{formError}</div>}
            <form className="product-form" onSubmit={handleSubmit}>
              <div className="field"><label className="field__label">Code SKU</label>
                <input name="sku" type="text" className="field__input" placeholder="IPH-15-PRO" value={form.sku} onChange={handleChange} required /></div>
              <div className="field"><label className="field__label">Nom du produit</label>
                <input name="name" type="text" className="field__input" placeholder="iPhone 15 Pro" value={form.name} onChange={handleChange} required /></div>
              <div className="field"><label className="field__label">Quantité initiale</label>
                <input name="quantity" type="number" min="0" className="field__input" placeholder="0" value={form.quantity} onChange={handleChange} required /></div>
              <div className="field"><label className="field__label">Seuil d'alerte</label>
                <input name="alert_threshold" type="number" min="0" className="field__input" placeholder="5" value={form.alert_threshold} onChange={handleChange} required /></div>
              <button className="btn btn--primary" type="submit" disabled={saving}>{saving ? 'Enregistrement…' : 'Créer le produit'}</button>
            </form>
          </div>
        </section>
      )}

      <section className="section">
        <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 className="section-title">Catalogue</h2>
          <input type="text" placeholder="Rechercher…" className="field__input" style={{ width: 260, padding: '7px 12px' }} value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        {loading ? <div className="loading">Chargement…</div>
          : filtered.length === 0 ? <div className="empty-state">{showFavOnly ? 'Aucun favori.' : 'Aucun produit trouvé.'}</div>
          : (
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: 40 }}></th>
                  <th>SKU</th><th>Nom</th><th>Quantité</th><th>Seuil</th><th>Statut</th>
                  {isAdmin && <th>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {filtered.map(p => {
                  const isFav   = favorites.includes(p.id)
                  const status  = p.quantity === 0 ? 'danger' : p.quantity <= p.alert_threshold ? 'warn' : 'ok'
                  return (
                    <tr key={p.id}>
                      <td>
                        <button className={`fav-btn ${isFav ? 'fav-btn--active' : ''}`} onClick={() => toggleFav(p.id)} title={isFav ? 'Retirer des favoris' : 'Ajouter aux favoris'}>
                          <StarIcon filled={isFav} />
                        </button>
                      </td>
                      <td className="td-sku">{p.sku}</td>
                      <td className="td-name">{p.name}</td>
                      <td className="mono font-bold">{p.quantity}</td>
                      <td className="mono text-muted">{p.alert_threshold}</td>
                      <td>
                        {status === 'danger' && <span className="badge badge--danger">Rupture</span>}
                        {status === 'warn'   && <span className="badge badge--warn">Alerte</span>}
                        {status === 'ok'     && <span className="badge badge--success">OK</span>}
                      </td>
                      {isAdmin && (
                        <td style={{ display: 'flex', gap: 6 }}>
                          <button className="btn btn--secondary btn--sm" onClick={() => openEdit(p)} style={{ display:'flex', alignItems:'center', gap:5 }}><EditIcon /> Modifier</button>
                          <button className="btn btn--danger btn--sm"    onClick={() => askDelete(p.id)} style={{ display:'flex', alignItems:'center', gap:5 }}><TrashIcon /> Supprimer</button>
                        </td>
                      )}
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