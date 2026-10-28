# Tokens

## Creating a token

Tokens are created from the **API tokens** section of `/user/settings`: give the token a name and pick its [scope](#scopes). The secret is shown once, right after creation, and cannot be read again. Revoke a token from the same list at any time.

The browser extension obtains its own token (named _Browser extension_, full access) through the [authorization handoff](/api/non-api-routes#extension-authorization-handoff) instead.

## Scopes

A token is created with one of two scopes:

| Scope         | Abilities        | What it can do                                                                   |
| ------------- | ---------------- | -------------------------------------------------------------------------------- |
| `full_access` | everything (`*`) | Read and write: the default, and what tokens created before scopes existed carry |
| `read_only`   | `read`           | Read only: it cannot create, edit, reorder or delete anything                    |

On `/api/v1/*` the ability a request needs follows from its HTTP method alone: `GET` and `HEAD` require `read`, every other method requires `write`. A `read_only` token calling a write endpoint is refused with `403` and the code `E_INSUFFICIENT_TOKEN_ABILITY`, see [Error responses](/api/error-responses).

On the [MCP server](/api/mcp) every call is a `POST`, so the ability is checked per tool instead: a `read_only` token can only call the read tools.

The scope is fixed when the token is created. To change it, create a new token and revoke the old one.

## Check token

Verify if an API token is valid.

**Endpoint:** `GET /api/v1/tokens/check`

**Headers:**

- `Authorization: Bearer <token>`

**Response:**

```json
{
	"message": "Token is valid",
	"userId": 1
}
```

A missing, expired or revoked token is answered with `401`, see [Error responses](/api/error-responses#authentication-and-rate-limiting). Like every `GET`, the check needs the `read` ability, which both scopes carry.

## Revoke the current token

Revokes the token the request is made with, for a client that signs out (the browser extension does this on disconnect). Unlike every other write endpoint, it works with a `read_only` token too, so a token can always retire itself.

**Endpoint:** `DELETE /api/v1/tokens/current`

**Headers:**

- `Authorization: Bearer <token>`

**Response:** `204 No Content`. The token stops working immediately. A missing, expired or revoked token is answered with `401`.
