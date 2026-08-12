import { middleware } from '#start/kernel';
import { apiThrottle } from '#start/limiter';

/**
 * Every `/api/v1/*` route but the health check: session-less auth plus the
 * shared rate limit.
 */
export const apiMiddleware = [
	middleware.auth({ guards: ['api'] }),
	apiThrottle,
];
