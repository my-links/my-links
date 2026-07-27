import type { HttpContext } from '@adonisjs/core/http';

/**
 * Hands the visitor over to an OAuth provider.
 *
 * Inertia drives its navigations with XHR, and a browser follows a 302 on an
 * XHR without ever leaving the page — so a request carrying `x-inertia` needs
 * `inertia.location`, which answers with the instruction to do a full page
 * visit instead. Two flows start an OAuth round trip (signing in, confirming
 * identity), and both need this exact fork.
 */
export function redirectToOauthProvider(ctx: HttpContext, redirectUrl: string) {
	if (ctx.request.header('x-inertia')) {
		return ctx.inertia.location(redirectUrl);
	}

	return ctx.response.redirect().toPath(redirectUrl);
}
