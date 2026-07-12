import { useEffect, useState } from 'react'
import { getMovements } from '../api'
import Layout from '../components/Layout'
import './History.css'

export default function History() {
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')

  useEffect(() => { fetchHistory() }, [])

  async function fetchHistory() {
    setLoading(true)
    setError('')
    try {
      const res = await getMovements()
      setHistory(res.data ?? [])
    } catch {
      setError("Erreur lors du chargement de l'historique.")
    } finally {
      setLoading(false)
    }
  }

  function formatDate(isoString) {
    if (!isoString) return '-'
    const date = new Date(isoString.replace(' ', 'T') + 'Z')
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
  }).format(date)
}

  const filtered = history.filter(m =>
    m.product_name?.toLowerCase().includes(search.toLowerCase()) ||
    m.user_name?.toLowerCase().includes(search.toLowerCase()) ||
    m.reason?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <Layout>
      <div className="page-header">
        <div>
          <h1 className="page-title">Historique des mouvements</h1>
          <p className="page-sub">Traçabilité complète des opérations de stock — {history.length} entrée(s)</p>
        </div>
        <input
          type="text"
          className="history-search"
          placeholder="Rechercher un produit, utilisateur, motif…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {error && <div className="page-error">{error}</div>}

      <section className="section">
        {loading ? (
          <div className="loading">Chargement de l'historique…</div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">Aucun mouvement enregistré pour le moment.</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Produit</th>
                <th>Utilisateur</th>
                <th>Quantité</th>
                <th>Motif</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(m => (
                <tr key={m.id}>
                  <td className="history-date">{formatDate(m.created_at)}</td>
                  <td className="history-product">{m.product_name}</td>
                  <td className="history-user">{m.user_name}</td>
                  <td>
                    <span className={`history-qty history-qty--${m.quantity_changed > 0 ? 'in' : 'out'}`}>
                      {m.quantity_changed > 0 ? '+' : ''}{m.quantity_changed}
                    </span>
                  </td>
                  <td className="history-reason">{m.reason}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </Layout>
  )
}