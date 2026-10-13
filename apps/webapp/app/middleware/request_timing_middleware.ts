import logger from '@adonisjs/core/services/logger';
import type { HttpContext } from '@adonisjs/core/http';

export const SLOW_REQUEST_THRESHOLD_MS = 500;

const NANOSECONDS_PER_MILLISECOND = 1_000_000;
const UNMATCHED_ROUTE_LABEL = 'unmatched';

export function isSlowRequest(durationMs: number): boolean {
	return durationMs >= SLOW_REQUEST_THRESHOLD_MS;
}

function roundToTenth(value: number): number {
	return Math.round(value * 10) / 10;
}

/**
 * Reports server time on every response and logs the slow ones. Only the route
 * pattern is logged, never the URL, which can carry a user's link.
 */
export default class RequestTimingMiddleware {
	async handle(ctx: HttpContext, next: () => Promise<void>) {
		const startedAt = process.hrtime.bigint();

		ctx.response.response.once('finish', () => {
			this.logIfSlow(ctx, startedAt);
		});

		try {
			await next();
		} finally {
			const durationMs = this.measureDurationMs(startedAt);
			ctx.response.header('Server-Timing', `app;dur=${durationMs.toFixed(1)}`);
		}
	}

	private measureDurationMs(startedAt: bigint): number {
		const elapsedNanoseconds = process.hrtime.bigint() - startedAt;
		return roundToTenth(
			Number(elapsedNanoseconds) / NANOSECONDS_PER_MILLISECOND
		);
	}

	private logIfSlow(ctx: HttpContext, startedAt: bigint): void {
		const durationMs = this.measureDurationMs(startedAt);
		if (!isSlowRequest(durationMs)) return;

		logger.info(
			{
				method: ctx.request.method(),
				route: ctx.route?.pattern ?? UNMATCHED_ROUTE_LABEL,
				status: ctx.response.response.statusCode,
				durationMs,
			},
			'slow request'
		);
	}
}
