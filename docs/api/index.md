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

A token has a [scope](/api/tokens#scopes) chosen at creation: `full_access` can read and write, `read_only` can only call `GET` and `HEAD` endpoints (and the read tools of the [MCP server](/api/mcp)). A write attempted with a read-only token is refused with `403`.

## Rate limiting

Every `/api/v1/*` route is throttled to **300 requests per minute**, keyed by authenticated user (so all of a user's devices and tabs share one budget) and falling back to the client IP for the unauthenticated health route. The same bucket also covers the public [`/l/:id`](/api/non-api-routes#link-redirect) and [`/favicon`](/api/non-api-routes#favicon-proxy) routes. The limit sits far above normal client usage: it protects small self-hosted instances from a runaway client.

The [MCP server](/api/mcp) at `/api/mcp` has its own bucket, also **300 requests per minute** and keyed the same way. It is tracked separately, so an agent looping through tool calls does not spend the budget the browser extension shares across a user's devices.

Exceeding a limit returns `429 Too Many Requests` with a `Retry-After` header, see [Error responses](/api/error-responses#authentication-and-rate-limiting).

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
