import { inject } from '@adonisjs/core';
import logger from '@adonisjs/core/services/logger';
import type { HttpContext } from '@adonisjs/core/http';

import { AUTH_EVENT_TYPE } from '#constants/auth';
import { resolveRequestOrigin } from '#lib/request_origin';
import { AuthEventService } from '#services/auth/auth_event_service';
import { ProviderLinkService } from '#services/auth/provider_link_service';
import { authProviderValidator } from '#validators/auth/auth_provider_validator';

const PROVIDER_UNLINKED_MESSAGE = 'That sign-in method has been removed';

/**
 * Detaching is provider-agnostic — it deletes a row, it does not talk to
 * anyone — so the provider travels as a route parameter rather than in the
 * route name.
 */
@inject()
export default class UnlinkProviderController {
	constructor(
		protected readonly providerLinkService: ProviderLinkService,
		protected readonly authEventService: AuthEventService
	) {}

	async execute(ctx: HttpContext) {
		const { provider } = await ctx.request.validateUsing(
			authProviderValidator,
			{ data: ctx.params }
		);
		const user = ctx.auth.getUserOrFail();

		await this.providerLinkService.unlink(user, provider);

		await this.authEventService.record({
			type: AUTH_EVENT_TYPE.PROVIDER_UNLINKED,
			userId: user.id,
			...resolveRequestOrigin(ctx),
		});

		ctx.session.flash('success', PROVIDER_UNLINKED_MESSAGE);
		logger.info(`[${user.email}] unlinked ${provider}`);

		return ctx.response.redirectToNamedRoute('user.settings');
	}
}
