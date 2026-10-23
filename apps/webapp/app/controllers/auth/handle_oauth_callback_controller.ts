import { inject } from '@adonisjs/core';
import type { HttpContext } from '@adonisjs/core/http';
import type { RoutesList } from '@adonisjs/core/types/http';

import { AUTH_EVENT_TYPE, AUTH_PROVIDER } from '#constants/auth';
import { GoogleAuthDisabledException } from '#exceptions/auth/google_auth_disabled_exception';
import {
	OauthAuthenticationRefusedException,
	OAUTH_REFUSAL_REASON,
} from '#exceptions/auth/oauth_authentication_refused_exception';
import { resolveRequestOrigin } from '#lib/request_origin';
import type User from '#models/user';
import { AuthEventService } from '#services/auth/auth_event_service';
import { GoogleAuthConfigService } from '#services/auth/google_auth_config_service';
import type { OauthIdentity } from '#services/auth/oauth_account_service';
import { OauthAccountService } from '#services/auth/oauth_account_service';
import type { OauthIntent } from '#services/auth/oauth_intent_service';
import {
	OAUTH_INTENT,
	OauthIntentService,
} from '#services/auth/oauth_intent_service';
import {
	PendingDeletionGuard,
	PENDING_DELETION_OUTCOME,
} from '#services/auth/pending_deletion_guard';
import { ProviderLinkService } from '#services/auth/provider_link_service';
import { SudoModeService } from '#services/auth/sudo_mode_service';
import { SessionService } from '#services/user/session_service';

/**
 * The subset of the Ally driver this controller reads after a callback.
 * Depending on the shape rather than on the concrete driver keeps the guards
 * provider-agnostic.
 */
type OauthCallbackState = {
	accessDenied(): boolean;
	stateMisMatch(): boolean;
	hasError(): boolean;
};

/**
 * Where a round trip that never delivered an identity puts the visitor back:
 * the page they started from, whatever they came for.
 */
const ABORTED_ROUND_TRIP_ROUTE = {
	[OAUTH_INTENT.SIGN_IN]: 'home',
	[OAUTH_INTENT.SUDO_CONFIRMATION]: 'auth.sudo',
	[OAUTH_INTENT.PROVIDER_LINK]: 'user.settings',
} as const satisfies Record<OauthIntent, keyof RoutesList['GET']>;

const OAUTH_STATE_PARAMETER = 'state';

// The provider's own error text is attacker-controlled on this URL, so it is never echoed.
const PROVIDER_ERROR_MESSAGE = 'Something went wrong';

const PROVIDER_LINKED_MESSAGE = 'That sign-in method has been added';

/**
 * The single landing route for every Google round trip, because the
 * callback URL is fixed in the provider's own configuration: a second one
 * would mean every self-hoster registering a second redirect URI.
 *
 * What the returning identity means is therefore decided here: it opens a
 * session, confirms one, or joins a second sign-in method to an account,
 * whichever the departing request armed.
 */
@inject()
export default class HandleOauthCallbackController {
	constructor(
		protected readonly sessionService: SessionService,
		protected readonly sudoModeService: SudoModeService,
		protected readonly authEventService: AuthEventService,
		protected readonly oauthIntentService: OauthIntentService,
		protected readonly providerLinkService: ProviderLinkService,
		protected readonly oauthAccountService: OauthAccountService,
		protected readonly pendingDeletionGuard: PendingDeletionGuard,
		protected readonly googleAuthConfigService: GoogleAuthConfigService
	) {}

	async execute(ctx: HttpContext) {
		if (!this.googleAuthConfigService.isEnabled) {
			throw new GoogleAuthDisabledException();
		}

		const google = ctx.ally.use('google');
		// Disarmed first, so an abandoned or failed round trip cannot leave the
		// callback expecting something that never comes.
		const intent = this.oauthIntentService.take(ctx.session);

		const callbackError = this.getCallbackError(
			google,
			ctx.request.input(OAUTH_STATE_PARAMETER)
		);
		if (callbackError) {
			ctx.session.flash('error', callbackError);

			return ctx.response.redirectToNamedRoute(
				ABORTED_ROUND_TRIP_ROUTE[intent]
			);
		}

		const googleUser = await google.user();
		const identity: OauthIdentity = {
			provider: AUTH_PROVIDER.GOOGLE,
			providerUserId: googleUser.id,
			email: googleUser.email,
			isEmailVerified: googleUser.emailVerificationState === 'verified',
			name: googleUser.name,
			nickName: googleUser.nickName,
		};

		const signedInUser = ctx.auth.user;

		// The intent alone is not enough: somebody who armed one, walked away and
		// came back signed out is starting a plain sign-in, and must not be met
		// with an authentication error for it.
		if (!signedInUser) {
			return this.signIn(ctx, identity);
		}

		return this.applyToSession(ctx, identity, signedInUser, intent);
	}

	/**
	 * What a returning identity does for a visitor who already has a session.
	 * Also stands in for the guest middleware the route cannot carry any more:
	 * landing here with nothing armed is starting a sign-in they do not need.
	 */
	private applyToSession(
		ctx: HttpContext,
		identity: OauthIdentity,
		user: User,
		intent: OauthIntent
	) {
		switch (intent) {
			case OAUTH_INTENT.SUDO_CONFIRMATION:
				return this.confirmIdentity(ctx, identity, user);
			case OAUTH_INTENT.PROVIDER_LINK:
				return this.linkProvider(ctx, identity, user);
			case OAUTH_INTENT.SIGN_IN:
			default:
				return ctx.response.redirectToNamedRoute('home');
		}
	}

	/**
	 * Joins the identity that came back to the account that asked for it. The
	 * departing route sat behind sudo mode, and the intent it armed is spent
	 * here: that single-use flag is what carries the proof across the round
	 * trip.
	 */
	private async linkProvider(
		ctx: HttpContext,
		identity: OauthIdentity,
		user: User
	) {
		await this.providerLinkService.link(user, identity);

		await this.authEventService.record({
			type: AUTH_EVENT_TYPE.PROVIDER_LINKED,
			userId: user.id,
			...resolveRequestOrigin(ctx),
		});

		ctx.session.flash('success', PROVIDER_LINKED_MESSAGE);
		ctx.logger.info(
			{ userId: user.id, provider: identity.provider },
			'provider linked'
		);

		return ctx.response.redirectToNamedRoute('user.settings');
	}

	private async signIn(ctx: HttpContext, identity: OauthIdentity) {
		const origin = resolveRequestOrigin(ctx);
		const user = await this.oauthAccountService.authenticate(identity, origin);

		const pendingDeletionOutcome = await this.pendingDeletionGuard.evaluate(
			user,
			ctx.session,
			origin
		);
		if (pendingDeletionOutcome === PENDING_DELETION_OUTCOME.BLOCKED_BY_ADMIN) {
			throw new OauthAuthenticationRefusedException(
				OAUTH_REFUSAL_REASON.ADMIN_DELETION_PENDING
			);
		}

		if (
			pendingDeletionOutcome === PENDING_DELETION_OUTCOME.REACTIVATION_REQUIRED
		) {
			return ctx.response.redirectToNamedRoute('auth.reactivate');
		}

		await ctx.auth.use('web').login(user);
		await this.sessionService.createAuthSession(user, ctx.session, origin);

		await this.authEventService.record({
			type: AUTH_EVENT_TYPE.LOGIN_SUCCEEDED,
			userId: user.id,
			...origin,
		});

		ctx.session.flash('success', 'Successfully authenticated');
		ctx.logger.info({ userId: user.id }, 'auth success');

		// Honors an intended URL stashed by AuthMiddleware so the extension auth handoff survives a login round-trip.
		return ctx.response.redirect().toIntendedRoute('home');
	}

	/**
	 * Accepts the round trip as proof only when the identity that came back is
	 * the one already signed in. Any other Google account (including one
	 * linked to another user here) proves nothing about this session.
	 */
	private async confirmIdentity(
		ctx: HttpContext,
		identity: OauthIdentity,
		user: User
	) {
		const attempt = {
			userId: user.id,
			origin: resolveRequestOrigin(ctx),
		};

		const linkedUser = await this.oauthAccountService.findLinkedUser(identity);
		if (linkedUser?.id !== user.id) {
			return this.sudoModeService.refuse(attempt);
		}

		await this.sudoModeService.grant(ctx.session, attempt);

		return ctx.response
			.redirect()
			.toPath(this.sudoModeService.takeReturnUrl(ctx.session));
	}

	private getCallbackError(
		callback: OauthCallbackState,
		returnedState: unknown
	): string | null {
		if (callback.accessDenied()) {
			return 'Access was denied';
		}

		// Ally compares undefined with undefined as a match, so a missing state must be refused here.
		if (!returnedState || callback.stateMisMatch()) {
			return 'Request expired. Retry again';
		}

		if (callback.hasError()) {
			return PROVIDER_ERROR_MESSAGE;
		}

		return null;
	}
}
