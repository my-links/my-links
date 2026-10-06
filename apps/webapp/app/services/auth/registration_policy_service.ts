import { inject } from '@adonisjs/core';

import env from '#start/env';
import { resolveRegistrationPolicy } from '#lib/auth/registration_policy';
import { AccountQueryService } from '#services/user/account_query_service';
import { RegistrationClosedException } from '#exceptions/auth/registration_closed_exception';

@inject()
export class RegistrationPolicyService {
	constructor(protected readonly accountQueryService: AccountQueryService) {}

	async isOpen(): Promise<boolean> {
		return resolveRegistrationPolicy({
			configuredPolicy: env.get('ALLOW_REGISTRATION'),
			hasAnyAccount: await this.accountQueryService.hasAnyAccount(),
		}).isOpen;
	}

	/**
	 * Guards both the form and the submission. Checking in one place is what
	 * keeps a closed instance from rendering a form that would always be
	 * refused, and an operator's `curl` from bypassing a check that only lived
	 * in the page.
	 */
	async assertIsOpen(): Promise<void> {
		if (await this.isOpen()) return;

		throw new RegistrationClosedException();
	}
}
