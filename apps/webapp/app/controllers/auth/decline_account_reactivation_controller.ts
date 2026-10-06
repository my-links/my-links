import { inject } from '@adonisjs/core';
import type { HttpContext } from '@adonisjs/core/http';

import { AccountReactivationService } from '#services/auth/account_reactivation_service';

const DECLINED_MESSAGE = 'Your account stays scheduled for deletion';

@inject()
export default class DeclineAccountReactivationController {
	constructor(
		protected readonly accountReactivationService: AccountReactivationService
	) {}

	async execute({ session, response }: HttpContext) {
		this.accountReactivationService.takePendingAccount(session);
		session.flash('success', DECLINED_MESSAGE);

		return response.redirectToNamedRoute('auth.login');
	}
}
