.movements-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  margin-bottom: 24px;
}

.movement-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.movement-preview .preview-body {
  padding: 20px;
}

.product-info {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.product-info__row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid var(--color-border-soft);
}

.product-info__row:last-of-type {
  border-bottom: none;
}

.product-info__row--preview {
  background: var(--color-accent-soft);
  padding: 10px 12px;
  border-radius: var(--radius-sm);
  margin-top: 8px;
}

.product-info__key {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--color-muted);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.product-info__val {
  font-size: 0.875rem;
  font-weight: 500;
}

.product-info__val.big {
  font-size: 1.4rem;
  font-weight: 700;
  letter-spacing: -0.03em;
}

.product-info__status {
  margin-top: 14px;
}

.movements-note {
  display: flex;
  align-items: center;
  gap: 10px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: 14px 20px;
  font-size: 0.875rem;
  color: var(--color-muted);
}

.qty-plus {
  color: var(--color-success);
  font-weight: 600;
}

.qty-minus {
  color: var(--color-danger);
  font-weight: 600;
}


@media (max-width: 768px) {
  .movements-grid {
    grid-template-columns: 1fr;
  }
}
