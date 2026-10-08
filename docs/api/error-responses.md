# Error responses

Errors on `/api/v1/*` are rendered as JSON (except `401` and `429`, see [below](#authentication-and-rate-limiting)), with the meaning carried by the HTTP status code. Clients should branch on the status, not on `message`. The body depends on the kind of error.

## Ordinary errors

A missing row, a forbidden action, a conflict and unexpected failures answer with a single `message`:

```json
{
	"message": "This token does not have the \"write\" ability"
}
```

## Validation errors

A request body or query string that fails validation answers `422` with an `errors` list, one entry per offending field:

```json
{
	"errors": [
		{
			"message": "The name field must have at least 1 characters",
			"rule": "minLength",
			"field": "name",
			"meta": {
				"min": 1
			}
		}
	]
}
```

`message`, `rule` and `field` are always there. `meta` carries the rule's parameters and only exists for rules that have some.

## Authentication and rate limiting

Two errors are rendered by their own handlers, which pick the format from the request's `Accept` header. Send `Accept: application/json` to get JSON; a request without a negotiable `Accept` header gets the message as plain text.

- `401` with `Accept: application/json`: `{ "errors": [{ "message": "Unauthorized access" }] }`
- `429` with `Accept: application/json`: `{ "errors": [{ "message": "Too many requests", "retryAfter": 12 }] }`, where `retryAfter` is the number of seconds until the budget refills

A `429` also carries the limiter's headers, whatever the format: `Retry-After` (seconds), `X-RateLimit-Limit`, `X-RateLimit-Remaining` and `X-RateLimit-Reset` (ISO 8601 timestamp). See [Rate limiting](/api/#rate-limiting).

## Status codes

| Status | Meaning                                                                                                                  |
| ------ | ------------------------------------------------------------------------------------------------------------------------ |
| `400`  | Malformed request that carries no more specific status                                                                   |
| `401`  | Token missing, expired or revoked: reconnect rather than retry                                                           |
| `403`  | Authenticated, but the token lacks the needed ability (`E_INSUFFICIENT_TOKEN_ABILITY`), see [Tokens](/api/tokens#scopes) |
| `404`  | No such collection or link, or one that is not yours                                                                     |
| `409`  | A reorder payload that no longer matches the current collection or section: reload and retry                             |
| `422`  | Validation failed (`errors` lists the offending fields), or an id that belongs to someone else                           |
| `429`  | Rate limit exceeded: wait for `Retry-After`                                                                              |
| `500`  | Unexpected server error                                                                                                  |

::: tip
A development instance (`NODE_ENV` other than `production`) answers ordinary errors with a verbose debugging payload instead of the bare `message`. Production instances use the shapes above.
:::
