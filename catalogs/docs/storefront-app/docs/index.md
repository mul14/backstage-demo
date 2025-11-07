# Storefront App

The Storefront App is a React single-page application that powers the public ShopSphere shopping experience. It is deployed globally behind a CDN to minimize latency.

## Responsibilities

- Render product catalog pages and real-time availability.
- Manage shopping carts locally and synchronize them via the session cache (Redis).
- Call the Checkout API when customers place orders.

## Dependencies

| Dependency | Purpose |
| --- | --- |
| `resource:default/orders-db` | Ensures cart snapshots and order summaries remain consistent. |
| `resource:default/session-cache` | Stores carts, auth context, and personalization state. |
| `api:default/checkout-api` | Performs checkout orchestration. |

## Development

```bash
# Install dependencies
$ yarn install

# Start the storefront locally
$ yarn dev --scope storefront-app
```
