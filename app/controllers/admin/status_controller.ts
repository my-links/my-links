import { healthChecks } from '#start/health';
import type { StatusReportCheck } from '#transformers/status_report_check';
import type { HttpContext } from '@adonisjs/core/http';
import logger from '@adonisjs/core/services/logger';

export default class StatusController {
	async render({ inertia }: HttpContext) {
		const [isHealthy, checks] = await Promise.all([
			this.isHealthy(),
			this.checks(),
		]);
		return inertia.render('status', {
			isHealthy,
			checks,
		});
	}

	private async isHealthy(): Promise<boolean> {
		const { isHealthy } = await this.getHealthChecks();
		return isHealthy;
	}

	private async checks(): Promise<StatusReportCheck[]> {
		const { checks } = await this.getHealthChecks();
		return checks;
	}

	private async getHealthChecks(): Promise<{
		isHealthy: boolean;
		checks: StatusReportCheck[];
	}> {
		const { isHealthy, checks } = await healthChecks.run();
		logger.info(checks);
		return {
			isHealthy,
			checks: checks as StatusReportCheck[],
		};
	}
}
