import { DateTime } from 'luxon';
import type { HttpContext } from '@adonisjs/core/http';
import type { NextFn } from '@adonisjs/core/types/http';

import { LAST_SEEN_AT_WRITE_THROTTLE_MINUTES } from '#constants/account';

export default class UpdateUserLastSeenMiddleware {
	async handle(ctx: HttpContext, next: NextFn) {
		const user = ctx.auth.user;
		if (user && this.isLastSeenStale(user.lastSeenAt)) {
			user.lastSeenAt = DateTime.local();
			await user.save();
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
