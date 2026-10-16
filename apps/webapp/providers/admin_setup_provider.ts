import type { ApplicationService } from '@adonisjs/core/types';

import env from '#start/env';
import { resolveAdminSetupToken } from '#lib/auth/admin_setup_token';
import { AdminSetupService } from '#services/auth/admin_setup_service';
import { AccountQueryService } from '#services/user/account_query_service';

const SETUP_PATH = '/auth/register';

/**
 * The setup token has to be the same for every request of one process, hence
 * the singleton. Without `ADMIN_SETUP_TOKEN` it is generated here at boot and
 * lives in memory only.
 */
export default class AdminSetupProvider {
	constructor(protected app: ApplicationService) {}

	register() {
		this.app.container.singleton(
			AdminSetupService,
			async (resolver) =>
				new AdminSetupService(
					await resolver.make(AccountQueryService),
					resolveAdminSetupToken(env.get('ADMIN_SETUP_TOKEN'))
				)
		);
	}

	async ready() {
		if (this.app.getEnvironment() !== 'web') return;

		const adminSetupService = await this.app.container.make(AdminSetupService);
		const logger = await this.app.container.make('logger');

		try {
			if (!(await adminSetupService.isSetupPending())) return;
		} catch (error) {
			logger.warn({ err: error }, 'could not tell whether an admin exists');
			return;
		}

		if (env.get('ADMIN_SETUP_TOKEN')) {
			logger.info(
				'no admin yet: register with the configured ADMIN_SETUP_TOKEN'
			);
			return;
		}

		// The one place a secret is logged on purpose: the operator reads the setup link here.
		logger.info(
			`no admin yet: register the first admin at ${env.get('APP_URL')}${SETUP_PATH}?setup_token=${adminSetupService.setupToken}`
		);
	}
}
