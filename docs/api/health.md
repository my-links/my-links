# Health

## Health check

Check the overall health status of the application. This route is intended for infrastructure probes/checks and **does not require authentication**.

**Endpoint:** `GET /api/v1/health`

**Headers:**

- No headers required

**Response (200 OK):**

```json
{
	"isHealthy": true
}
```

**Response (503 Service Unavailable):**

```json
{
	"isHealthy": false
}
```
