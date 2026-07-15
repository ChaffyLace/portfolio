import { useEffect, useState, useMemo } from 'react'
import { getProducts, getMovements } from '../api'
import Layout from '../components/Layout'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, LineChart, Line, CartesianGrid } from 'recharts'
import './Dashboard.css'

const formatDate = (d) => d ? new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }) : ''

export default function Dashboard() {
  const [products, setProducts] = useState([])
  const [movements, setMovements] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let ok = true
    Promise.all([getProducts(), getMovements()])
      .then(([pr, mr]) => { if (ok) { setProducts(pr.data ?? []); setMovements(mr.data ?? []) } })
      .catch(console.error)
      .finally(() => { if (ok) setLoading(false) })
    return () => { ok = false }
  }, [])

  const stats = useMemo(() => {
    const alertCount = products.filter(p => p.quantity <= p.alert_threshold).length
    const timelineData = [...movements].sort((a,b) => new Date(a.created_at)-new Date(b.created_at))
      .slice(-10).map(m => ({ date: formatDate(m.created_at), quantite: m.quantity_changed, label: m.product_sku || 'Produit' }))
    return {
      total: products.length,
      qty: products.reduce((s,p) => s+p.quantity, 0),
      alertCount,
      outOfStock: products.filter(p => p.quantity === 0).length,
      alertProducts: products.filter(p => p.quantity <= p.alert_threshold),
      pie: [{ name: 'En alerte', value: alertCount, color: '#ef4444' }, { name: 'Stock OK', value: products.length - alertCount, color: '#10b981' }],
      timelineData,
    }
  }, [products, movements])

  if (loading) return <Layout><div className="dashboard-loading">Chargement…</div></Layout>

  return (
    <Layout>
      <div className="dashboard-header">
        <h1 className="dashboard-title">Dashboard</h1>
        <p className="dashboard-sub">Voici l'état de votre stock</p>
      </div>
      <div className="stats-grid">
        <div className="stat-card"><span className="stat-label">Produits référencés</span><div className="stat-value">{stats.total}</div></div>
        <div className="stat-card"><span className="stat-label">Unités en stock</span><div className="stat-value">{stats.qty}</div></div>
        <div className="stat-card stat-card--warn"><span className="stat-label">En alerte seuil</span><div className="stat-value">{stats.alertCount}</div></div>
        <div className="stat-card"><span className="stat-label">Rupture de stock</span><div className="stat-value">{stats.outOfStock}</div></div>
      </div>
      <div className="analytics-row">
        <section className="chart-card">
          <h2 className="chart-title">Mouvements récents</h2>
          <div className="chart-inner">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats.timelineData} margin={{ top:5,right:5,left:-25,bottom:0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="date" tick={{ fill:'#9ca3af', fontSize:10 }} />
                <YAxis tick={{ fill:'#9ca3af', fontSize:10 }} />
                <Tooltip />
                <Line type="monotone" dataKey="quantite" stroke="#3b82f6" strokeWidth={2} dot={{ r:2 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>
        <section className="chart-card">
          <h2 className="chart-title">Niveaux par SKU</h2>
          <div className="chart-inner">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={products} margin={{ top:5,right:5,left:-25,bottom:0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="sku" tick={{ fill:'#9ca3af', fontSize:9 }} />
                <YAxis tick={{ fill:'#9ca3af', fontSize:10 }} />
                <Tooltip />
                <Bar dataKey="quantity" fill="#3b82f6" radius={[3,3,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
        <section className="chart-card">
          <h2 className="chart-title">État de santé</h2>
          <div className="chart-inner">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={stats.pie} dataKey="value" nameKey="name" innerRadius={40} outerRadius={55} paddingAngle={3}>
                  {stats.pie.map((e,i) => <Cell key={i} fill={e.color} />)}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" iconType="circle" iconSize={8} wrapperStyle={{ fontSize:'10px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>
      <section className="table-section">
        <div className="table-header">
          <h2 className="table-title">Produits en alerte</h2>
          <span className="table-link">Voir tout →</span>
        </div>
        {stats.alertProducts.length === 0 ? (
          <div className="table-empty">Aucun produit sous le seuil d'alerte.</div>
        ) : (
          <table className="custom-table">
            <thead><tr><th>SKU</th><th>NOM</th><th>QUANTITÉ</th><th>SEUIL</th><th>STATUT</th></tr></thead>
            <tbody>
              {stats.alertProducts.map(p => (
                <tr key={p.id}>
                  <td className="td-muted">{p.sku}</td><td>{p.name}</td>
                  <td className="td-bold">{p.quantity}</td><td className="td-muted">{p.alert_threshold}</td>
                  <td><span className="status-badge">ALERTE</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </Layout>
  )
}