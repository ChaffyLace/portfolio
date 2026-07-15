import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useEffect, useState } from 'react';
import { getProducts } from '../api';
import './Sidebar.css';

const DashboardIcon = () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg>);
const BoxIcon = () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" x2="12" y1="22.08" y2="12"/></svg>);
const ActivityIcon = () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M17 12h-2l-2 5-2-10-2 5H7"/></svg>);
const HistoryIcon = () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M12 7v5l4 2"/></svg>);
const AlertIcon = () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>);
const UserPlusIcon = () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" x2="19" y1="8" y2="14"/><line x1="22" x2="16" y1="11" y2="11"/></svg>);
const LogOutIcon = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/></svg>);

const NAV = [
  { to: '/dashboard', icon: <DashboardIcon />, label: 'Dashboard' },
  { to: '/products',  icon: <BoxIcon />,        label: 'Produits' },
  { to: '/movements', icon: <ActivityIcon />,   label: 'Mouvements' },
  { to: '/history',   icon: <HistoryIcon />,    label: 'Historique' },
  { to: '/alerts',    icon: <AlertIcon />,      label: 'Alertes' },
];

const ADMIN_NAV = [
  { to: '/invite', icon: <UserPlusIcon />, label: 'Inviter un utilisateur' },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [alertCount, setAlertCount] = useState(0);

  useEffect(() => {
    getProducts().then(res => {
      const prods = res.data ?? []
      setAlertCount(prods.filter(p => p.quantity <= p.alert_threshold).length)
    }).catch(() => {})
  }, [])

  function handleLogout() { logout(); navigate('/login'); }

  return (
    <aside className="sidebar">
      <div className="sidebar__brand">
        <span className="sidebar__logo">SF</span>
        <span className="sidebar__title">StockFlow</span>
      </div>

      <nav className="sidebar__nav">
        {NAV.map(({ to, icon, label, badge }) => (
          <NavLink key={to} to={to}
            className={({ isActive }) => 'sidebar__link' + (isActive ? ' sidebar__link--active' : '')}>
            <span className="sidebar__icon">{icon}</span>
            {label}
            {to === '/alerts' && alertCount > 0 && (
              <span className="sidebar__badge">{alertCount}</span>
            )}
          </NavLink>
        ))}

        {user?.role === 'admin' && (
          <>
            <div className="sidebar__section-label">Administration</div>
            {ADMIN_NAV.map(({ to, icon, label }) => (
              <NavLink key={to} to={to}
                className={({ isActive }) => 'sidebar__link' + (isActive ? ' sidebar__link--active' : '')}>
                <span className="sidebar__icon">{icon}</span>
                {label}
              </NavLink>
            ))}
          </>
        )}
      </nav>

      <div className="sidebar__footer">
        <div className="sidebar__user">
          <span className="sidebar__avatar">{user?.name?.[0]?.toUpperCase() ?? '?'}</span>
          <div>
            <div className="sidebar__user-name">{user?.name ?? 'Utilisateur'}</div>
            <div className="sidebar__user-role">{user?.role ?? 'user'}</div>
          </div>
        </div>
        <button className="sidebar__logout" onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <LogOutIcon /> Déconnexion
        </button>
      </div>
    </aside>
  );
}