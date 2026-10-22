# Health

## Health check

Check the overall health status of the application. This route is intended for infrastructure probes/checks and **does not require authentication**.

**Endpoint:** `GET /api/v1/health`

**Headers:**

- No headers required

**Response (200 OK):**

```json
{
	"isHealthy": true,
	"capabilities": {
		"extensionAuthHandoff": true,
		"syncDelta": true,
		"clickTracking": true
	}
}
```

**Response (503 Service Unavailable):**

```json
{
	"isHealthy": false,
	"capabilities": {
		"extensionAuthHandoff": true,
		"syncDelta": true,
		"clickTracking": true
	}
}
```

## Capabilities

`capabilities` lets a client detect what an instance supports before calling it, instead of failing against a route that does not exist there yet. A self-hosted instance running an older version simply omits the newer flags, so a client should treat a missing flag as `false` and fall back gracefully. The object is part of both the 200 and the 503 body.

| Flag                   | Meaning                                                                                                 |
| ---------------------- | ------------------------------------------------------------------------------------------------------- |
| `extensionAuthHandoff` | The [extension authorization handoff](/api/non-api-routes#extension-authorization-handoff) is available |
| `syncDelta`            | [`GET /api/v1/sync`](/api/sync) accepts a `since` cursor and answers with a delta                       |
| `clickTracking`        | Link opens are counted through the `POST /l/:id` beacon                                                 |
