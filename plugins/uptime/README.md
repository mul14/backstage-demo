# Simple Uptime demo

This lightweight plugin renders a single card on the entity overview page. It
performs a plain `fetch` to the URL provided via the `demo.backstage.io/uptime-url`
annotation:

```yaml
metadata:
  annotations:
    demo.backstage.io/uptime-url: https://example.com/healthz
```

If the response resolves with a 2xx status the service is marked as **Healthy**,
otherwise it is marked as **Down**. Redirects (3xx) are naturally followed by
`fetch`, so no extra handling is required. This keeps the workshop demo easy to
understand and modify.
