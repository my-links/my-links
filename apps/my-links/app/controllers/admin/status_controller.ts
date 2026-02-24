import {
	StatusReportCheck,
	StatusReportCheckDto,
} from '#dtos/status_report_check';
import { healthChecks } from '#start/health';
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

	private async checks(): Promise<StatusReportCheckDto[]> {
		const { checks } = await this.getHealthChecks();
		return StatusReportCheckDto.fromArray(checks as StatusReportCheck[]);
	}

	private async getHealthChecks(): Promise<{
		isHealthy: boolean;
		checks: StatusReportCheckDto[];
	}> {
		const { isHealthy, checks } = await healthChecks.run();
		logger.info(checks);
		return {
			isHealthy,
			checks: StatusReportCheckDto.fromArray(checks as StatusReportCheck[]),
		};
	}
}
