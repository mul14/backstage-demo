# Checkout Service

The Checkout Service is a Node.js backend that manages payments, taxes, fraud checks, and order creation.

## Responsibilities

1. Create checkout sessions and compute totals.
2. Authorize payments using the PSP integration.
3. Emit order lifecycle events via the `order-events-api`.

## Key Endpoints

- `/checkout/session`
- `/checkout/session/{id}/confirm`

## Runbook

1. **Alert received** – consult dashboards for latency spikes.
2. **Scale up** – use autoscaling policy or temporarily add replicas.
3. **Rollback** – deploy the last green build with `yarn workspace checkout-service deploy --env production`.

## Local Development

```bash
# Start service with local dependencies
$ REDIS_URL=redis://localhost:6379 POSTGRES_URL=postgres://localhost:5432/orders yarn workspace checkout-service dev
```
