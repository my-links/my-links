import type { HttpContext } from '@adonisjs/core/http';
import type { NextFn } from '@adonisjs/core/types/http';

import { TOKEN_ABILITY } from '#constants/api_token';
import { assertTokenAbility } from '#lib/api/tokens/abilities';

const SAFE_METHODS = new Set(['GET', 'HEAD']);

/**
 * Every `/api/v1/*` route is a plain REST verb over one resource, so the
 * ability a request needs follows from its HTTP method alone — no per-route
 * annotation to keep in sync as routes are added. `/api/mcp` can't use this:
 * every MCP call arrives as `POST` regardless of whether the tool behind it
 * reads or writes, so it checks abilities per tool instead (see `runTool`).
 */
export default class RequireTokenAbilityMiddleware {
	async handle(ctx: HttpContext, next: NextFn) {
		const ability = SAFE_METHODS.has(ctx.request.method())
			? TOKEN_ABILITY.READ
			: TOKEN_ABILITY.WRITE;

		assertTokenAbility(ctx, ability);

		return next();
	}
}
