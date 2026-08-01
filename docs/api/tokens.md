# Tokens

## Check token

Verify if an API token is valid.

**Endpoint:** `GET /api/v1/tokens/check`

**Headers:**

- `Authorization: Bearer <token>`

**Response:**

```json
{
	"message": "Token is valid"
}
```

**Error response (401 Unauthorized):**

```json
{
	"message": "Unauthorized"
}
```
