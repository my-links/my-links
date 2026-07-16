import type { HttpContext } from '@adonisjs/core/http';

import { healthChecks } from '#start/health';

export default class HealthController {
	async render({ response }: HttpContext) {
		const report = await healthChecks.run();
		const result = {
			isHealthy: report.isHealthy,
		};

		if (report.isHealthy) {
			return response.ok(result);
		}

		return response.serviceUnavailable(result);
	}
}
