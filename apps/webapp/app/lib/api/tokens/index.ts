import type { HttpContext } from '@adonisjs/core/http';

export function getTokenFromHeader(ctx: HttpContext): string | null {
	const authHeader = ctx.request.header('authorization');
	if (!authHeader) {
		return null;
	}

	const parts = authHeader.split(' ');
	if (parts.length !== 2 || parts[0] !== 'Bearer') {
		return null;
	}

	return parts[1];
}
