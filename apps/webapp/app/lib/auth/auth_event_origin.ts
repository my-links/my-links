import type { HttpContext } from '@adonisjs/core/http';

import type { AuthEventOrigin } from '#services/auth/auth_event_service';

/**
 * Reads where a request came from, for the authentication journal.
 *
 * It lives outside the services because they must not know `HttpContext`, and
 * outside the controllers because every controller that journals an event needs
 * the exact same two fields read the exact same way.
 */
export function resolveAuthEventOrigin(ctx: HttpContext): AuthEventOrigin {
	return {
		ip: ctx.request.ip(),
		userAgent: ctx.request.header('user-agent') ?? null,
	};
}
