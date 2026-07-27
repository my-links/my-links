import logger from '@adonisjs/core/services/logger';
import type { HttpContext } from '@adonisjs/core/http';

import { toLoggableUrl } from '#lib/logging/loggable_url';

/**
 * Assets served by the dev toolchain. They are the bulk of the traffic in
 * development and none of it says anything about the application.
 */
const IGNORED_PATH_PREFIXES = [
	'/node_modules',
	'/inertia',
	'/@vite',
	'/@react-refresh',
] as const;

const IGNORED_PATH_SUFFIX = '.ts';

export default class LogRequest {
	async handle({ request }: HttpContext, next: () => Promise<void>) {
		const url = request.url();

		if (this.isWorthLogging(url)) {
			logger.debug(`[${request.method()}]: ${toLoggableUrl(url)}`);
		}

		await next();
	}

	private isWorthLogging(url: string): boolean {
		return (
			!IGNORED_PATH_PREFIXES.some((prefix) => url.startsWith(prefix)) &&
			!url.includes(IGNORED_PATH_SUFFIX)
		);
	}
}
