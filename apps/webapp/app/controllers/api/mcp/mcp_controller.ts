import { inject } from '@adonisjs/core';
import { HttpContext } from '@adonisjs/core/http';

import { McpSessionManager } from '#services/mcp/mcp_session_manager';

/**
 * Bridges `/api/mcp` to the MCP Streamable HTTP transport. All three verbs
 * (POST for JSON-RPC requests, GET for the SSE stream, DELETE for session
 * close) funnel through the same session lookup — the transport itself
 * branches on the method once a session is resolved.
 */
@inject()
export default class McpController {
	constructor(private readonly sessionManager: McpSessionManager) {}

	async handle(ctx: HttpContext) {
		await this.sessionManager.handleRequest(ctx);
	}
}
