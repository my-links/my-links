# MCP server

MyLinks exposes a [Model Context Protocol](https://modelcontextprotocol.io) server so an LLM agent can manage bookmarks through natural language, with the same reach as the REST API, minus admin actions and reordering: the REST API has [reorder routes](/api/collections#reorder-own-collections), but MCP has no reorder tools.

**Endpoint:** `/api/mcp`

**Transport:** [Streamable HTTP](https://modelcontextprotocol.io/specification/2025-06-18/basic/transports#streamable-http): `POST` for JSON-RPC requests, `GET` for the SSE stream, `DELETE` to close a session.

**Headers:**

- `Authorization: Bearer <token>`

Uses the same bearer tokens as the REST API, created from `/user/settings`. Tokens are shared: there is no MCP-specific token, and a token's [scope](/api/tokens#scopes) applies per tool. A `full_access` token can call every tool, a `read_only` token can only call the read tools below, and a write tool called with it reports the refusal as a tool error inside the JSON-RPC response.

## Connecting a client

Point any MCP client that supports Streamable HTTP at the endpoint with the bearer token attached, e.g. for a client config file:

```json
{
	"mcpServers": {
		"my-links": {
			"url": "https://<your-instance>/api/mcp",
			"headers": {
				"Authorization": "Bearer <your-token>"
			}
		}
	}
}
```

## Tools

**Read:**

- `links.list`, `links.get`, `links.search`, `links.list_favorites`
- `collections.list`, `collections.get`
- `inbox.get`

**Write:**

- `links.create`, `links.update`, `links.delete`, `links.toggle_favorite`, `links.move_to_collection`, `links.add_to_collection`
- `collections.create`, `collections.update`, `collections.delete`, `collections.follow`, `collections.unfollow`

`links.search` matches name, URL, and description: a small server-side substitute for the fuzzy matcher the webapp and extension each run client-side, which an MCP client has no access to.
