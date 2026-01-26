import { healthChecks } from '#start/health';
import type { HttpContext } from '@adonisjs/core/http';

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
