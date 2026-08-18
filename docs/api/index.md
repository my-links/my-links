# API reference

MyLinks exposes a REST API under `/api/v1`, authenticated with Bearer tokens created from `/user/settings`. It backs the browser extension and is the same API any other client can use.

An OpenAPI 3.1 document is generated from the source with `node ace openapi:generate` (from `apps/webapp`), written to `apps/webapp/.adonisjs/openapi.json`, and is what the extension's typed client is built from.

## Base URL

All API endpoints are prefixed with `/api/v1`.

## Authentication

All API endpoints require authentication using a Bearer token. Include the token in the `Authorization` header:

```
Authorization: Bearer <your-token>
```

To create an API token, use the web interface at `/user/settings`. The browser extension obtains its own token through the [authorization handoff](/api/non-api-routes#extension-authorization-handoff) instead.

## Rate limiting

Every `/api/v1/*` route is throttled to **300 requests per minute**, keyed by authenticated user (so all of a user's devices and tabs share one budget) and falling back to the client IP for the unauthenticated health route. The limit sits far above normal client usage — it protects small self-hosted instances from a runaway client.

Exceeding it returns `429 Too Many Requests` with a `Retry-After` header.

The store backing the counters is the database.

## CORS

`/api/v1/*` is the only path reachable cross-origin, and only from browser extension origins (`chrome-extension://`, `moz-extension://`). Credentials are off: the browser never attaches the session cookie, so the API's own bearer token remains the only way in.

Everything outside `/api/v1` is the Inertia application, which is same-origin and session-authenticated.

## Sections

- [Collections](/api/collections)
- [Links](/api/links)
- [Sync](/api/sync)
- [Tokens](/api/tokens)
- [Health](/api/health)
- [MCP server](/api/mcp)
- [Non-API routes](/api/non-api-routes)
- [Error responses](/api/error-responses)
- [Data types](/api/data-types)
