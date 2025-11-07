# ShopSphere Developer Portal

The ShopSphere Developer Portal is the Backstage instance that gathers every service, resource, and documentation asset for the commerce platform. It provides:

- A single entry point for browsing components, APIs, and resources.
- TechDocs hosting so teams can publish Markdown-based runbooks.
- Software Templates that bootstrap new services with platform guardrails.

## Operational Expectations

The platform team owns availability. Changes to the portal configuration should follow normal change management and PR review, with mandatory end-to-end smoke tests before deployments.

## Useful Commands

```bash
# Start the portal in development mode
$ yarn dev

# Build the production bundle for the portal
$ yarn backstage build
```
