# Admin Console

The Admin Console is the React application that operations teams use to interact with the Admin Service.

## Key Workflows

- Search for orders and update their state.
- Configure promotions and feature flags.
- File case notes for customer support.

## Technical Notes

- Built with React and Vite; served internally via SSO-protected CDN.
- Communicates exclusively with the `admin-management-api`.
- Observability uses browser RUM metrics piped into the shared telemetry stack.

## Development

```bash
# Run the console locally
$ yarn workspace admin-console dev

# Build static assets
$ yarn workspace admin-console build
```
