import type { HttpContext } from '@adonisjs/core/http';

/**
 * Where a request came from, for the audit journal. Both fields are nullable
 * because a request behind a misconfigured proxy, or one sent by a client
 * that omits a user agent, still has to be journaled.
 */
export type RequestOrigin = {
	readonly ip: string | null;
	readonly userAgent: string | null;
};

/**
 * Reads where a request came from.
 *
 * It lives outside the services because they must not know `HttpContext`, and
 * outside the controllers because every controller that journals an event needs
 * the exact same two fields read the exact same way.
 */
export function resolveRequestOrigin(
	ctx: Pick<HttpContext, 'request'>
): RequestOrigin {
	return {
		ip: ctx.request.ip(),
		userAgent: ctx.request.header('user-agent') ?? null,
	};
}

/** For work that has no request behind it: a command, a schedule. */
export const NO_REQUEST_ORIGIN: RequestOrigin = {
	ip: null,
	userAgent: null,
};
