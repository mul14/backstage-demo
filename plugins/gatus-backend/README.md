# Gatus backend plugin

This backend plugin exposes `/api/gatus/uptime/:namespace/:name`. The handler:

1. Looks up the referenced component in the catalog.
2. Reads the `twin.sh/gatus-url` annotation.
3. Fetches the upstream Gatus `/statuses` endpoint.
4. Returns the resulting payload to the frontend.

## Installation

The demo backend already registers the plugin in `packages/backend/src/index.ts`:

```ts
const backend = createBackend();
// …
backend.add(import('@internal/plugin-gatus-backend'));
```

Ensure your catalog entities define the annotation:

```yaml
metadata:
  annotations:
    twin.sh/gatus-url: https://status.twin.sh/api/v1/endpoints/misc_database/statuses
```

## Development

Run `yarn start` from `plugins/gatus-backend` to develop the backend plugin in
isolation, or `yarn start` from the repo root to run the full Backstage stack.
