import { HttpContext } from '@adonisjs/core/http';

export function getTokenFromHeader(ctx: HttpContext) {
	const authHeader = ctx.request.header('Authorization');

	if (!authHeader || !authHeader.startsWith('Bearer ')) {
		return null;
	}

	return authHeader.substring(7);
}
