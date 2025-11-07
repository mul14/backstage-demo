# Admin Service

The Admin Service exposes the Admin Management API used by customer support, merchandising, and fraud teams.

## Capabilities

- Update orders (reship, refund, resend notifications).
- Launch and manage promotions.
- Provide audit trails for each action performed via the admin console.

## Architecture

- Written in TypeScript/Node.js with NestJS-style modules.
- Stores canonical data in `resource:default/orders-db` and caches lookups in `resource:default/session-cache`.
- Authenticates requests via the internal SSO provider.

## Deployment

Deployed on the same Kubernetes cluster as other core services, but isolated in an operations namespace. Use `yarn workspace admin-service deploy --env production`.
