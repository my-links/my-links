import type { HttpContext } from '@adonisjs/core/http';

import { healthChecks } from '#start/health';

/**
 * Capability flags let API clients (the browser extension in particular)
 * detect what a given instance supports before calling it. A self-hosted
 * instance running an older version simply omits newer flags, so the client
 * can fall back gracefully instead of breaking against `?since=`-style
 * endpoints or routes that don't exist yet.
 */
const capabilities = {
	extensionAuthHandoff: true,
	apiSearch: true,
	syncDelta: true,
	clickTracking: true,
} as const;

export default class HealthController {
	async render({ response }: HttpContext) {
		const report = await healthChecks.run();
		const result = {
			isHealthy: report.isHealthy,
			capabilities,
		};

		if (report.isHealthy) {
			return response.ok(result);
		}

		return response.serviceUnavailable(result);
	}
}
