import logger from '@adonisjs/core/services/logger';
import type { HttpContext } from '@adonisjs/core/http';

import { healthChecks } from '#start/health';
import { toStatusReportChecks } from '#lib/health/status_report';

export default class StatusController {
	async render({ inertia }: HttpContext) {
		// One run per page load: the previous split between an `isHealthy` and a
		// `checks` helper ran every registered check twice.
		const report = await healthChecks.run();
		logger.info(report.checks);

		return inertia.render('status', {
			isHealthy: report.isHealthy,
			checks: toStatusReportChecks(report),
		});
	}
}
