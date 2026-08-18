import { middleware } from '#start/kernel';
import { apiThrottle, mcpThrottle } from '#start/limiter';

/**
 * Every `/api/v1/*` route but the health check: session-less auth plus the
 * shared rate limit.
 */
export const apiMiddleware = [
	middleware.auth({ guards: ['api'] }),
	apiThrottle,
];

/**
 * `/api/mcp`: same session-less auth as the REST API, but its own throttle
 * bucket — an MCP client's own budget, not the extension's.
 */
export const mcpMiddleware = [
	middleware.auth({ guards: ['api'] }),
	mcpThrottle,
];
