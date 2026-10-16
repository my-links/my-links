import type { TransactionClientContract } from '@adonisjs/lucid/types/database';

import { isMatchingSetupToken } from '#lib/auth/admin_setup_token';
import { AccountQueryService } from '#services/user/account_query_service';

/**
 * Decides who may claim the administrator role of a fresh instance. Without
 * it the first visitor to reach a just-deployed instance would own it, so
 * claiming takes the setup token the operator finds in their own logs or
 * environment.
 */
export class AdminSetupService {
	constructor(
		protected readonly accountQueryService: AccountQueryService,
		readonly setupToken: string
	) {}

	isValidSetupToken(submittedToken: string | undefined): boolean {
		return isMatchingSetupToken(this.setupToken, submittedToken);
	}

	/**
	 * Once any administrator exists the token is dead weight: it can never
	 * mint a second one.
	 */
	async canClaimAdministrator(
		submittedToken: string | undefined,
		trx?: TransactionClientContract
	): Promise<boolean> {
		if (await this.accountQueryService.hasAdministrator(trx)) return false;

		return this.isValidSetupToken(submittedToken);
	}

	async isSetupPending(): Promise<boolean> {
		return !(await this.accountQueryService.hasAdministrator());
	}
}
