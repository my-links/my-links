# Error responses

Errors on `/api/v1/*` share one body shape, with the meaning carried by the HTTP status code:

```json
{
	"message": "Bad Request",
	"errors": [
		{
			"field": "name",
			"message": "The name field is required"
		}
	]
}
```

Clients should branch on the status, not on `message`:

| Status | Meaning                                                         |
| ------ | --------------------------------------------------------------- |
| `400`  | Malformed request that carries no more specific status          |
| `401`  | Token missing, expired or revoked — reconnect rather than retry |
| `403`  | Authenticated, but the resource belongs to someone else         |
| `404`  | No such collection or link                                      |
| `422`  | Validation failed; `errors` lists the offending fields          |
| `429`  | Rate limit exceeded — see [Rate limiting](/api/#rate-limiting)  |
| `500`  | Unexpected server error                                         |
