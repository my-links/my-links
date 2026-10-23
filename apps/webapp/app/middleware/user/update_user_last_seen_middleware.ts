import type { HttpContext } from '@adonisjs/core/http';
import type { NextFn } from '@adonisjs/core/types/http';
import db from '@adonisjs/lucid/services/db';
import { DateTime } from 'luxon';

import { LAST_SEEN_AT_WRITE_THROTTLE_MINUTES } from '#constants/account';

export default class UpdateUserLastSeenMiddleware {
	async handle(ctx: HttpContext, next: NextFn) {
		const user = ctx.auth.user;
		if (user && this.isLastSeenStale(user.lastSeenAt)) {
			const lastSeenAt = DateTime.local();
			// Query builder on purpose: save() would bump users.updated_at, which is not a profile change.
			await db
				.from('users')
				.where('id', user.id)
				.update({ last_seen_at: lastSeenAt.toJSDate() });
			user.lastSeenAt = lastSeenAt;
		}

		const output = await next();
		return output;
	}

	private isLastSeenStale(lastSeenAt: DateTime | null): boolean {
		if (!lastSeenAt) return true;

		const minutesSinceLastSeen = DateTime.local().diff(
			lastSeenAt,
			'minutes'
		).minutes;

		return minutesSinceLastSeen >= LAST_SEEN_AT_WRITE_THROTTLE_MINUTES;
	}
}
