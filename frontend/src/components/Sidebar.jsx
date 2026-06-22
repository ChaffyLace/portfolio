import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './Sidebar.css'

const NAV = [
  { to: '/dashboard', icon: '⬛', label: 'Dashboard' },
  { to: '/products',  icon: '📦', label: 'Produits' },
  { to: '/movements', icon: '🔄', label: 'Mouvements' },
]

export default function Sidebar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <aside className="sidebar">
      <div className="sidebar__brand">
        <span className="sidebar__logo">SF</span>
        <span className="sidebar__title">StockFlow</span>
      </div>

      <nav className="sidebar__nav">
        {NAV.map(({ to, icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              'sidebar__link' + (isActive ? ' sidebar__link--active' : '')
            }
          >
            <span className="sidebar__icon">{icon}</span>
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar__footer">
        <div className="sidebar__user">
          <span className="sidebar__avatar">
            {user?.name?.[0]?.toUpperCase() ?? '?'}
          </span>
          <div>
            <div className="sidebar__user-name">{user?.name ?? 'Utilisateur'}</div>
            <div className="sidebar__user-role">{user?.role ?? 'user'}</div>
          </div>
        </div>
        <button className="sidebar__logout" onClick={handleLogout}>
          Déconnexion
        </button>
      </div>
    </aside>
  )
}
