.dashboard-header {
  margin-bottom: 28px;
}
.dashboard-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #111827;
  margin: 0 0 4px 0;
}
.dashboard-sub {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 24px;
}
.stat-card {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
}
.stat-card--warn {
  background: #fffbeb;
  border-color: #fcd34d;
}
.stat-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
.stat-value {
  font-size: 2rem;
  font-weight: 700;
  color: #111827;
  margin-top: 8px;
  line-height: 1;
}

.analytics-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin-bottom: 24px;
}
.chart-card {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  height: 260px;
}
.chart-title {
  font-size: 0.95rem;
  font-weight: 600;
  color: #374151;
  margin: 0 0 16px 0;
}
.chart-inner {
  flex: 1;
  width: 100%;
  height: 100%;
  min-height: 180px;
  position: relative;
}

.table-section {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}
.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #e5e7eb;
}
.table-title {
  font-size: 0.95rem;
  font-weight: 600;
  margin: 0;
  color: #111827;
}
.table-link {
  font-size: 0.8rem;
  color: #6b7280;
  cursor: pointer;
}
.custom-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
}
.custom-table th {
  text-align: left;
  padding: 12px 20px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  color: #6b7280;
  background: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
}
.custom-table td {
  padding: 14px 20px;
  border-bottom: 1px solid #e5e7eb;
  color: #374151;
}
.custom-table tr:last-child td {
  border-bottom: none;
}
.td-muted {
  color: #6b7280;
}
.td-bold {
  font-weight: 700;
}
.status-badge {
  display: inline-block;
  background: #fee2e2;
  color: #ef4444;
  padding: 4px 10px;
  border-radius: 100px;
  font-size: 0.72rem;
  font-weight: 700;
}

.dashboard-loading, .table-empty {
  padding: 40px;
  text-align: center;
  color: #6b7280;
  font-size: 0.9rem;
}