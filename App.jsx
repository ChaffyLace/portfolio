.sidebar {
  width: var(--sidebar-width);
  min-height: 100vh;
  background: var(--color-panel);
  border-right: 1px solid var(--color-panel-border);
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
}

.sidebar__brand {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 20px 20px 24px;
  border-bottom: 1px solid var(--color-panel-border);
}

.sidebar__logo {
  width: 32px;
  height: 32px;
  background: var(--color-accent);
  color: #1b1f24;
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 0.8rem;
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.sidebar__title {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 1.05rem;
  color: #fff;
  letter-spacing: -0.02em;
}

.sidebar__nav {
  flex: 1;
  padding: 16px 12px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.sidebar__link {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 12px;
  border-radius: var(--radius-sm);
  text-decoration: none;
  color: var(--color-panel-muted);
  font-size: 0.875rem;
  font-weight: 500;
  transition: background 0.15s, color 0.15s;
}

.sidebar__link:hover {
  background: var(--color-panel-soft);
  color: var(--color-panel-text);
}

.sidebar__link--active {
  background: var(--color-panel-soft);
  color: #fff;
  border-left: 2px solid var(--color-accent);
  padding-left: 10px;
}

.sidebar__icon {
  font-size: 0.95rem;
  width: 18px;
  text-align: center;
}

.sidebar__footer {
  padding: 16px;
  border-top: 1px solid var(--color-panel-border);
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.sidebar__user {
  display: flex;
  align-items: center;
  gap: 10px;
}

.sidebar__avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--color-panel-soft);
  border: 1px solid var(--color-panel-border);
  color: var(--color-panel-text);
  font-family: var(--font-display);
  font-weight: 600;
  font-size: 0.8rem;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.sidebar__user-name {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--color-panel-text);
}

.sidebar__user-role {
  font-size: 0.7rem;
  color: var(--color-panel-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.sidebar__logout {
  width: 100%;
  padding: 8px;
  background: transparent;
  border: 1px solid var(--color-panel-border);
  border-radius: var(--radius-sm);
  color: var(--color-panel-muted);
  font-size: 0.8rem;
  cursor: pointer;
  transition: border-color 0.15s, color 0.15s;
}

.sidebar__logout:hover {
  border-color: var(--color-danger);
  color: var(--color-danger);
}
