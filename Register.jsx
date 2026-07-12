import { useEffect, useState, useMemo } from 'react'
import { getProducts, getMovements } from '../api'
import Layout from '../components/Layout'
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend, LineChart, Line, CartesianGrid 
} from 'recharts'
import './Dashboard.css'

/**
 * Formats an ISO date string into a localized short date (DD/MM).
 */
const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })
}

export default function Dashboard() {
  const [products, setProducts] = useState([])
  const [movements, setMovements] = useState([])
  const [loading, setLoading] = useState(true)

  // Fetch dashboard data on component mount
  useEffect(() => {
    let isMounted = true

    async function fetchDashboardData() {
      try {
        const [productsResponse, movementsResponse] = await Promise.all([
          getProducts(),
          getMovements()
        ])
        
        if (isMounted) {
          setProducts(productsResponse.data ?? [])
          setMovements(movementsResponse.data ?? [])
        }
      } catch (err) {
        console.error("Failed to load dashboard data:", err)
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    fetchDashboardData()

    return () => {
      isMounted = false
    }
  }, [])

  // Memoize analytics calculations
  const analytics = useMemo(() => {
    const totalReferences = products.length
    const alertCount = products.filter(p => p.quantity <= p.alert_threshold).length
    const outOfStockCount = products.filter(p => p.quantity === 0).length
    const totalQuantity = products.reduce((acc, p) => acc + p.quantity, 0)
    
    const alertProducts = products.filter(p => p.quantity <= p.alert_threshold)

    const stockStatusDistribution = [
      { name: 'En Alerte', value: alertCount, color: '#ef4444' }, 
      { name: 'Stock OK', value: totalReferences - alertCount, color: '#10b981' } 
    ]

    const sortedMovements = [...movements].sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
    const timelineData = sortedMovements.slice(-10).map(m => ({
      date: formatDate(m.created_at),
      quantite: m.quantity_changed,
      label: m.product_sku || m.sku || 'Produit'
    }))

    return { 
      totalReferences, 
      alertCount, 
      outOfStockCount,
      totalQuantity, 
      alertProducts,
      stockStatusDistribution, 
      timelineData 
    }
  }, [products, movements])

  if (loading) {
    return (
      <Layout>
        <div className="dashboard-loading">Calcul des données analytiques...</div>
      </Layout>
    )
  }

  return (
    <Layout>
      {/* Page Header */}
      <div className="dashboard-header">
        <h1 className="dashboard-title">Dashboard</h1>
        <p className="dashboard-sub">Bonjour, Abdel Mourid voici l'état de votre stock</p>
      </div>

      {/* Primary KPIs Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-label">Produits Référencés</span>
          <div className="stat-value">{analytics.totalReferences}</div>
        </div>
        <div className="stat-card">
          <span className="stat-label">Unités en stock</span>
          <div className="stat-value">{analytics.totalQuantity}</div>
        </div>
        <div className="stat-card stat-card--warn">
          <span className="stat-label">En alerte seuil</span>
          <div className="stat-value">{analytics.alertCount}</div>
        </div>
        <div className="stat-card">
          <span className="stat-label">Rupture de stock</span>
          <div className="stat-value">{analytics.outOfStockCount}</div>
        </div>
      </div>

      {/* Analytics Row: Compact 3-column charts layout */}
      <div className="analytics-row">
        
        {/* Chart 1: Recent Movements Timeline */}
        <section className="chart-card">
          <h2 className="chart-title">Mouvements récents</h2>
          <div className="chart-inner">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={analytics.timelineData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="date" tick={{ fill: '#9ca3af', fontSize: 10 }} />
                <YAxis tick={{ fill: '#9ca3af', fontSize: 10 }} />
                <Tooltip formatter={(value, name, props) => [value, `Qté (${props.payload.label})`]} />
                <Line type="monotone" dataKey="quantite" stroke="#3b82f6" strokeWidth={2} dot={{ r: 2 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* Chart 2: Stock Levels per SKU */}
        <section className="chart-card">
          <h2 className="chart-title">Niveaux par SKU</h2>
          <div className="chart-inner">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={products} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="sku" tick={{ fill: '#9ca3af', fontSize: 9 }} />
                <YAxis tick={{ fill: '#9ca3af', fontSize: 10 }} />
                <Tooltip />
                <Bar dataKey="quantity" fill="#3b82f6" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* Chart 3: Overall Stock Health */}
        <section className="chart-card">
          <h2 className="chart-title">État de santé</h2>
          <div className="chart-inner">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie 
                  data={analytics.stockStatusDistribution} 
                  dataKey="value" 
                  nameKey="name" 
                  innerRadius={40} 
                  outerRadius={55} 
                  paddingAngle={3}
                >
                  {analytics.stockStatusDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '10px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </section>

      </div>

      {/* Critical Alerts Data Table */}
      <section className="table-section">
        <div className="table-header">
          <h2 className="table-title">Produits en alerte</h2>
          <span className="table-link">Voir tout →</span>
        </div>
        
        {analytics.alertProducts.length === 0 ? (
          <div className="table-empty">Aucun produit sous le seuil d'alerte.</div>
        ) : (
          <table className="custom-table">
            <thead>
              <tr>
                <th>SKU</th>
                <th>NOM</th>
                <th>QUANTITÉ</th>
                <th>SEUIL</th>
                <th>STATUT</th>
              </tr>
            </thead>
            <tbody>
              {analytics.alertProducts.map(product => (
                <tr key={product.id}>
                  <td className="td-muted">{product.sku}</td>
                  <td>{product.name}</td>
                  <td className="td-bold">{product.quantity}</td>
                  <td className="td-muted">{product.alert_threshold}</td>
                  <td>
                    <span className="status-badge">ALERTE</span>
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