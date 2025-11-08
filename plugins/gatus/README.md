# Gatus Uptime plugin

This frontend plugin adds an **Uptime** tab to eligible catalog entities and
renders the latest status history taken straight from your
[Gatus](https://github.com/TwiN/gatus) deployment. It relies on the companion
`@internal/plugin-gatus-backend` package to read the catalog, resolve the
annotation, and proxy the upstream request.

## Usage

1. Add the annotation to any component entity:

   ```yaml
   metadata:
     annotations:
       twin.sh/gatus-url: https://status.twin.sh/api/v1/endpoints/misc_database/statuses
   ```

2. Visit the entity in Backstage. An **Uptime** tab will be visible whenever the
   annotation is present. Data is fetched via the backend plugin by calling
   `/api/gatus/uptime/<namespace>/<name>`.

3. Browse to `/gatus` in the Backstage app for quick start instructions.
