import type { ApplicationService } from '@adonisjs/core/types';

import { capturedLogDestination } from '#tests/helpers/captured_logs';

/**
 * Registers after every real provider has bound its services but before any of
 * them boots, which is the only window where the logger config is loaded and
 * the logger has not been built yet.
 */
export default class CapturedLogsProvider {
	constructor(protected readonly app: ApplicationService) {}

	register() {
		this.app.config.set(
			'logger.loggers.app.destination',
			capturedLogDestination
		);
	}
}
