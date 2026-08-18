import { inject } from '@adonisjs/core';
import { randomUUID } from 'node:crypto';
import type { HttpContext } from '@adonisjs/core/http';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { isInitializeRequest } from '@modelcontextprotocol/sdk/types.js';
import { WebStandardStreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js';

import { LinkService } from '#services/links/link_service';
import { registerLinkTools } from '#services/mcp/tools/link_tools';
import packageJson from '../../../package.json' with { type: 'json' };
import { CollectionService } from '#services/collections/collection_service';
import { registerCollectionTools } from '#services/mcp/tools/collection_tools';
import { CollectionLinkService } from '#services/collections/collection_link_service';
import { CollectionFollowerService } from '#services/collections/collection_follower_service';

const MCP_SESSION_HEADER = 'mcp-session-id';

/**
 * A session outlives no client crash or dropped connection on its own — the
 * only clean-close signal is a client sending `DELETE`, which an unhealthy
 * client is exactly the one that never will. Idle sessions are swept instead
 * of relying on that.
 */
const SESSION_IDLE_TTL_MS = 30 * 60 * 1000;
const SESSION_SWEEP_INTERVAL_MS = 5 * 60 * 1000;

type McpSession = {
	transport: WebStandardStreamableHTTPServerTransport;
	lastActivityAt: number;
};

/**
 * One `McpServer` + `WebStandardStreamableHTTPServerTransport` pair per MCP
 * session, keyed by the session id the transport generates on `initialize`.
 * Safe as a container singleton — the injected services only ever reach into
 * the *current* request's `HttpContext` for the authenticated user at call
 * time, never into anything captured at construction, so the same instances
 * stay correct across every session and every request within a session.
 *
 * Bridges through a hand-built Fetch `Request`/`Response` and `ctx.response`
 * rather than the SDK's Node-compatible `StreamableHTTPServerTransport`
 * (which wraps `@hono/node-server`'s `getRequestListener`): that wrapper
 * writes the response with `res.writeHead(status, headers)`, which replaces
 * the Node response's existing header set outright rather than merging into
 * it — silently dropping every header Adonis middleware staged earlier
 * (shield, CORS, the rate limiter). Going through `ctx.response` instead
 * keeps this on the same header-writing path as the rest of the app.
 */
@inject()
export class McpSessionManager {
	private readonly sessions = new Map<string, McpSession>();

	constructor(
		private readonly linkService: LinkService,
		private readonly collectionService: CollectionService,
		private readonly collectionLinkService: CollectionLinkService,
		private readonly collectionFollowerService: CollectionFollowerService
	) {
		setInterval(() => {
			void this.evictIdleSessions();
		}, SESSION_SWEEP_INTERVAL_MS).unref();
	}

	async handleRequest(ctx: HttpContext): Promise<void> {
		const sessionId = ctx.request.header(MCP_SESSION_HEADER);

		const session = sessionId ? this.sessions.get(sessionId) : undefined;
		if (session) {
			session.lastActivityAt = Date.now();
			await this.respond(ctx, session.transport);
			return;
		}

		if (sessionId) {
			ctx.response.status(404).json({
				jsonrpc: '2.0',
				error: { code: -32001, message: 'Session not found' },
				id: null,
			});
			return;
		}

		if (!isInitializeRequest(ctx.request.body())) {
			ctx.response.status(400).json({
				jsonrpc: '2.0',
				error: {
					code: -32000,
					message: 'Bad Request: Mcp-Session-Id header is required',
				},
				id: null,
			});
			return;
		}

		const transport = new WebStandardStreamableHTTPServerTransport({
			sessionIdGenerator: () => randomUUID(),
			// Every tool here is a plain request/response call — nothing ever
			// pushes a server-initiated notification — so there's no reason to
			// hold a streaming connection open per session. Plain JSON responses
			// are also far friendlier to a self-hosted instance's reverse proxy
			// than long-lived SSE.
			enableJsonResponse: true,
			onsessioninitialized: (id) => {
				this.sessions.set(id, { transport, lastActivityAt: Date.now() });
			},
		});
		transport.onclose = () => {
			if (transport.sessionId) {
				this.sessions.delete(transport.sessionId);
			}
		};

		await this.buildServer().connect(transport);
		await this.respond(ctx, transport);
	}

	/**
	 * Not private: a test drives this directly with a synthetic `now` instead
	 * of waiting on the real sweep interval.
	 */
	async evictIdleSessions(now: number = Date.now()): Promise<number> {
		const staleSessionIds = [...this.sessions.entries()]
			.filter(
				([, session]) => now - session.lastActivityAt >= SESSION_IDLE_TTL_MS
			)
			.map(([sessionId]) => sessionId);

		await Promise.all(
			staleSessionIds.map(async (sessionId) => {
				const session = this.sessions.get(sessionId);
				this.sessions.delete(sessionId);
				await session?.transport.close();
			})
		);

		return staleSessionIds.length;
	}

	get sessionCount(): number {
		return this.sessions.size;
	}

	private async respond(
		ctx: HttpContext,
		transport: WebStandardStreamableHTTPServerTransport
	): Promise<void> {
		const response = await transport.handleRequest(
			this.buildFetchRequest(ctx),
			{
				parsedBody: ctx.request.body(),
			}
		);

		ctx.response.status(response.status);
		response.headers.forEach((value, key) => {
			ctx.response.header(key, value);
		});

		const isEventStream = response.headers
			.get('content-type')
			?.includes('text/event-stream');
		if (isEventStream && response.body) {
			ctx.response.stream(response.body);
			return;
		}

		ctx.response.send(await response.text());
	}

	private buildFetchRequest(ctx: HttpContext): Request {
		const headers = new Headers();
		for (const [key, value] of Object.entries(ctx.request.headers())) {
			if (value === undefined) continue;
			for (const entry of Array.isArray(value) ? value : [value]) {
				headers.append(key, entry);
			}
		}

		return new Request(ctx.request.completeUrl(true), {
			method: ctx.request.method(),
			headers,
		});
	}

	private buildServer(): McpServer {
		const server = new McpServer({
			name: 'my-links',
			version: packageJson.version,
		});
		registerLinkTools(server, this.linkService, this.collectionLinkService);
		registerCollectionTools(
			server,
			this.collectionService,
			this.collectionFollowerService
		);
		return server;
	}
}
