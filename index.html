import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getProducts } from '../api'
import Layout from '../components/Layout'
import './Dashboard.css'

export default function Dashboard() {
  const { user } = useAuth()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    getProducts()
      .then(res => setProducts(res.data.data ?? []))
      .catch(() => setError('Impossible de charger les produits'))
      .finally(() => setLoading(false))
  }, [])

  const total = products.length
  const alerts = products.filter(p => p.quantity <= p.alert_threshold).length
  const outOfStock = products.filter(p => p.quantity === 0).length
  const totalQty = products.reduce((sum, p) => sum + (p.quantity ?? 0), 0)

  return (
    <Layout>
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-sub">Bonjour, {user?.name ?? 'utilisateur'} — voici l'état de votre stock</p>
        </div>
        <Link to="/products" className="btn btn--primary btn--sm">+ Nouveau produit</Link>
      </div>

      {error && <div className="page-error">{error}</div>}

      <div className="kpi-grid">
        <div className="kpi-card">
          <span className="kpi-label">Produits référencés</span>
          <span className="kpi-value mono">{loading ? '—' : total}</span>
        </div>
        <div className="kpi-card">
          <span className="kpi-label">Unités en stock</span>
          <span className="kpi-value mono">{loading ? '—' : totalQty}</span>
        </div>
        <div className={`kpi-card ${alerts > 0 ? 'kpi-card--warn' : ''}`}>
          <span className="kpi-label">En alerte seuil</span>
          <span className="kpi-value mono">{loading ? '—' : alerts}</span>
        </div>
        <div className={`kpi-card ${outOfStock > 0 ? 'kpi-card--danger' : ''}`}>
          <span className="kpi-label">Rupture de stock</span>
          <span className="kpi-value mono">{loading ? '—' : outOfStock}</span>
        </div>
      </div>

      <section className="section">
        <div className="section-header">
          <h2 className="section-title">Produits en alerte</h2>
          <Link to="/products" className="section-link">Voir tout →</Link>
        </div>

        {loading ? (
          <div className="loading">Chargement…</div>
        ) : alerts === 0 ? (
          <div className="empty-state">Aucun produit en alerte. Tout est à jour ✓</div>
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
              {products
                .filter(p => p.quantity <= p.alert_threshold)
                .map(p => (
                  <tr key={p.id}>
                    <td className="mono td-sku">{p.sku}</td>
                    <td>{p.name}</td>
                    <td className="mono">{p.quantity}</td>
                    <td className="mono">{p.alert_threshold}</td>
                    <td>
                      {p.quantity === 0
                        ? <span className="badge badge--danger">Rupture</span>
                        : <span className="badge badge--warn">Alerte</span>}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        )}
      </section>
    </Layout>
  )
}
