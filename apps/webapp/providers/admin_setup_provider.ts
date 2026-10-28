import type { ApplicationService } from '@adonisjs/core/types';

import { buildAdminSetupLink } from '#lib/auth/admin_setup_link';
import { resolveAdminSetupToken } from '#lib/auth/admin_setup_token';
import { AdminSetupService } from '#services/auth/admin_setup_service';
import { AccountQueryService } from '#services/user/account_query_service';
import env from '#start/env';

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
		const router = await this.app.container.make('router');

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
			`no admin yet: register the first admin at ${buildAdminSetupLink(router, env.get('APP_URL'), adminSetupService.setupToken)}`
		);
	}
}
