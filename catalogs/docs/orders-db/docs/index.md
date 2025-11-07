# Orders Database

This document captures the primary tables that power ShopSphere checkout and fulfillment flows.

## Schema Diagram

Below is rendered from the DBML definition, so engineers can evolve the schema directly in docs.

```dbml
table orders {
  id uuid [pk]
  customer_id uuid [not null]
  total_amount numeric(12,2) [not null]
  currency varchar(3) [not null]
  status varchar(32) [default: 'pending']
  created_at timestamptz [default: `now()`]
  updated_at timestamptz
}

table order_items {
  id uuid [pk]
  order_id uuid [ref: > orders.id]
  sku varchar(64)
  quantity int
  unit_price numeric(12,2)
}

table payment_intents {
  id uuid [pk]
  order_id uuid [ref: > orders.id]
  provider varchar(32)
  status varchar(32)
  authorization_code varchar(64)
  captured_at timestamptz
}
```

## Operational Notes

- **Backups:** PITR enabled with 7-day retention. For ad-hoc restores use `pg-backupctl restore --target-time <ts>`.
- **Extensions:** `uuid-ossp`, `pg_stat_statements`, and `pgcrypto` are enabled cluster-wide.
- **Connections:** Checkout Service uses pooled connections via PgBouncer. Admin Service connects through read-write replicas for back-office edits.
