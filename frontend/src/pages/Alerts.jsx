import { useEffect, useState } from 'react'
import { getProducts } from '../api'
import Layout from '../components/Layout'
import './Alerts.css'

export default function Alerts() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getProducts()
      .then(res => setProducts((res.data ?? []).filter(p => p.quantity <= p.alert_threshold)))
      .finally(() => setLoading(false))
  }, [])

  const outOfStock = products.filter(p => p.quantity === 0)
  const lowStock   = products.filter(p => p.quantity > 0 && p.quantity <= p.alert_threshold)

  return (
    <Layout>
      <div className="page-header">
        <div>
          <h1 className="page-title">Alertes de stock</h1>
          <p className="page-sub">{products.length} produit(s) nécessitent votre attention</p>
        </div>
      </div>

      {loading ? <div className="alerts-loading">Chargement…</div> : (
        <>
          {/* Ruptures */}
          <section className="alerts-section">
            <div className="alerts-section__header alerts-section__header--danger">
              <span className="alerts-section__dot alerts-section__dot--danger" />
              <span className="alerts-section__title">Ruptures de stock</span>
              <span className="alerts-section__count alerts-section__count--danger">{outOfStock.length}</span>
            </div>
            {outOfStock.length === 0 ? (
              <div className="alerts-empty alerts-empty--success">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                Aucune rupture de stock
              </div>
            ) : (
              <table className="alerts-table">
                <thead><tr><th>SKU</th><th>Produit</th><th>Quantité</th><th>Seuil</th><th>Statut</th></tr></thead>
                <tbody>
                  {outOfStock.map(p => (
                    <tr key={p.id}>
                      <td className="td-mono">{p.sku}</td>
                      <td className="td-name">{p.name}</td>
                      <td className="td-mono td-danger">{p.quantity}</td>
                      <td className="td-mono td-muted">{p.alert_threshold}</td>
                      <td><span className="alerts-badge alerts-badge--danger">Rupture</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>

          {/* Stock bas */}
          <section className="alerts-section">
            <div className="alerts-section__header alerts-section__header--warn">
              <span className="alerts-section__dot alerts-section__dot--warn" />
              <span className="alerts-section__title">Stock bas</span>
              <span className="alerts-section__count alerts-section__count--warn">{lowStock.length}</span>
            </div>
            {lowStock.length === 0 ? (
              <div className="alerts-empty alerts-empty--success">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                Aucun produit en stock bas
              </div>
            ) : (
              <table className="alerts-table">
                <thead><tr><th>SKU</th><th>Produit</th><th>Quantité</th><th>Seuil</th><th>Statut</th></tr></thead>
                <tbody>
                  {lowStock.map(p => (
                    <tr key={p.id}>
                      <td className="td-mono">{p.sku}</td>
                      <td className="td-name">{p.name}</td>
                      <td className="td-mono td-warn">{p.quantity}</td>
                      <td className="td-mono td-muted">{p.alert_threshold}</td>
                      <td><span className="alerts-badge alerts-badge--warn">Alerte</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>
        </>
      )}
    </Layout>
  )
}