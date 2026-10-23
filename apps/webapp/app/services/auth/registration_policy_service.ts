import { inject } from '@adonisjs/core';

import { RegistrationClosedException } from '#exceptions/auth/registration_closed_exception';
import { SetupLinkRequiredException } from '#exceptions/auth/setup_link_required_exception';
import { resolveRegistrationPolicy } from '#lib/auth/registration_policy';
import { AdminSetupService } from '#services/auth/admin_setup_service';
import { AccountQueryService } from '#services/user/account_query_service';
import env from '#start/env';

@inject()
export class RegistrationPolicyService {
	constructor(
		protected readonly accountQueryService: AccountQueryService,
		protected readonly adminSetupService: AdminSetupService
	) {}

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

	/**
	 * The window in which a fresh instance waits for its first administrator
	 * and the policy is left to the instance. An explicit `ALLOW_REGISTRATION`
	 * is the operator's own decision and is never second-guessed.
	 */
	async isSetupWindow(): Promise<boolean> {
		if (env.get('ALLOW_REGISTRATION')) return false;

		return !(await this.accountQueryService.hasAdministrator());
	}

	/**
	 * Inside the setup window only the holder of the setup token may open an
	 * account; otherwise whoever registers first would lock the owner out.
	 */
	async isSetupLinkRequired(
		submittedToken: string | undefined
	): Promise<boolean> {
		if (!(await this.isSetupWindow())) return false;

		return !this.adminSetupService.isValidSetupToken(submittedToken);
	}

	/**
	 * Guards the page: the setup link has to reach a form even though the
	 * derived policy may already read "closed".
	 */
	async assertIsReachable(): Promise<void> {
		if (await this.isSetupWindow()) return;

		await this.assertIsOpen();
	}

	async assertCanRegister(submittedToken: string | undefined): Promise<void> {
		if (await this.isSetupLinkRequired(submittedToken)) {
			throw new SetupLinkRequiredException();
		}
		if (await this.isSetupWindow()) return;

		await this.assertIsOpen();
	}
}
