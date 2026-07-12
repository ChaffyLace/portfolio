/* ── En-tête de page ───────────────────────────── */
.page-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 28px;
  flex-wrap: wrap;
}

.page-title {
  font-size: 1.5rem;
  font-weight: 700;
}

.page-sub {
  font-size: 0.875rem;
  color: var(--color-muted);
  margin-top: 4px;
}

.page-error {
  background: var(--color-danger-soft);
  color: var(--color-danger);
  border: 1px solid var(--color-danger);
  border-radius: var(--radius-sm);
  padding: 10px 14px;
  font-size: 0.875rem;
  margin-bottom: 20px;
}

/* ── KPI cards ─────────────────────────────────── */
.kpi-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(170px, 1fr));
  gap: 16px;
  margin-bottom: 36px;
}

.kpi-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: 20px 20px 18px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  box-shadow: var(--shadow-card);
}

.kpi-card--warn {
  border-color: var(--color-accent);
  background: var(--color-accent-soft);
}

.kpi-card--danger {
  border-color: var(--color-danger);
  background: var(--color-danger-soft);
}

.kpi-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--color-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.kpi-value {
  font-size: 2rem;
  font-weight: 700;
  letter-spacing: -0.03em;
  line-height: 1;
}

/* ── Sections ──────────────────────────────────── */
.section {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  overflow: hidden;
  box-shadow: var(--shadow-card);
  margin-bottom: 24px;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid var(--color-border-soft);
}

.section-title {
  font-size: 0.95rem;
  font-weight: 600;
}

.section-link {
  font-size: 0.8rem;
  color: var(--color-muted);
  text-decoration: none;
  font-weight: 500;
}

.section-link:hover {
  color: var(--color-accent);
}

/* ── Data table ────────────────────────────────── */
.data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
}

.data-table th {
  text-align: left;
  padding: 10px 20px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--color-muted);
  background: var(--color-bg);
  border-bottom: 1px solid var(--color-border-soft);
}

.data-table td {
  padding: 12px 20px;
  border-bottom: 1px solid var(--color-border-soft);
  vertical-align: middle;
}

.data-table tbody tr:last-child td {
  border-bottom: none;
}

.data-table tbody tr:hover td {
  background: var(--color-bg);
}

.td-sku {
  font-size: 0.8rem;
  color: var(--color-muted);
}

/* ── Badges ────────────────────────────────────── */
.badge {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 100px;
  font-size: 0.72rem;
  font-weight: 600;
  letter-spacing: 0.03em;
  text-transform: uppercase;
}

.badge--warn {
  background: var(--color-accent-soft);
  color: #8a5c10;
}

.badge--danger {
  background: var(--color-danger-soft);
  color: var(--color-danger);
}

.badge--success {
  background: var(--color-success-soft);
  color: var(--color-success);
}

/* ── States ────────────────────────────────────── */
.loading {
  padding: 32px 20px;
  text-align: center;
  color: var(--color-muted);
  font-size: 0.875rem;
}

.empty-state {
  padding: 32px 20px;
  text-align: center;
  color: var(--color-muted);
  font-size: 0.875rem;
}
