import type { HttpContext } from '@adonisjs/core/http';
import type { NextFn } from '@adonisjs/core/types/http';
import { DateTime } from 'luxon';

export default class UpdateUserLastSeenMiddleware {
	async handle(ctx: HttpContext, next: NextFn) {
		const user = ctx.auth.user;
		if (user) {
			user.lastSeenAt = DateTime.local();
			await user.save();
		}

		const output = await next();
		return output;
	}
}
