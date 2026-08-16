import { inject } from '@adonisjs/core';
import logger from '@adonisjs/core/services/logger';
import type { HttpContext } from '@adonisjs/core/http';

import User from '#models/user';
import { AUTH_EVENT_TYPE } from '#constants/auth';
import { UserService } from '#services/user/user_service';
import { resolveRequestOrigin } from '#lib/request_origin';
import { SessionService } from '#services/user/session_service';
import { AuthEventService } from '#services/auth/auth_event_service';
import { AccountReactivationService } from '#services/auth/account_reactivation_service';

const DECLINED_MESSAGE = 'Your account stays scheduled for deletion';

@inject()
export default class ReactivateAccountController {
	constructor(
		protected readonly userService: UserService,
		protected readonly sessionService: SessionService,
		protected readonly authEventService: AuthEventService,
		protected readonly accountReactivationService: AccountReactivationService
	) {}

	/**
	 * Reads without clearing: a page refresh before the visitor decides must
	 * not lose the account it is asking about.
	 */
	async render({ inertia, session, response }: HttpContext) {
		const pending = this.accountReactivationService.peekPendingAccount(session);
		if (!pending) {
			return response.redirectToNamedRoute('auth.login');
		}

		return inertia.render('auth/reactivate_account', { email: pending.email });
	}

	async execute(ctx: HttpContext) {
		const pending = this.accountReactivationService.takePendingAccount(
			ctx.session
		);
		if (!pending) {
			return ctx.response.redirectToNamedRoute('auth.login');
		}

		const user = await User.findOrFail(pending.userId);
		await this.userService.reactivateAccount(user.id);

		await ctx.auth.use('web').login(user);
		await this.sessionService.createAuthSession(user);

		await this.authEventService.record({
			type: AUTH_EVENT_TYPE.LOGIN_SUCCEEDED,
			userId: user.id,
			...resolveRequestOrigin(ctx),
		});

		logger.info(`[${user.email}] reactivated and signed in`);

		return ctx.response.redirect().toIntendedRoute('collection.favorites');
	}

	async decline({ session, response }: HttpContext) {
		this.accountReactivationService.takePendingAccount(session);
		session.flash('success', DECLINED_MESSAGE);

		return response.redirectToNamedRoute('auth.login');
	}
}
