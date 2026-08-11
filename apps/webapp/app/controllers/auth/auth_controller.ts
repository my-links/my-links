import { inject } from '@adonisjs/core';
import logger from '@adonisjs/core/services/logger';
import type { HttpContext } from '@adonisjs/core/http';
import type { RoutesList } from '@adonisjs/core/types/http';

import type User from '#models/user';
import { resolveRequestOrigin } from '#lib/request_origin';
import { SessionService } from '#services/user/session_service';
import { AUTH_EVENT_TYPE, AUTH_PROVIDER } from '#constants/auth';
import { redirectToOauthProvider } from '#lib/auth/oauth_redirect';
import { SudoModeService } from '#services/auth/sudo_mode_service';
import { AuthEventService } from '#services/auth/auth_event_service';
import type { OauthIntent } from '#services/auth/oauth_intent_service';
import type { OauthIdentity } from '#services/auth/oauth_account_service';
import { ProviderLinkService } from '#services/auth/provider_link_service';
import { OauthAccountService } from '#services/auth/oauth_account_service';
import { GoogleAuthConfigService } from '#services/auth/google_auth_config_service';
import GoogleAuthDisabledException from '#exceptions/auth/google_auth_disabled_exception';
import {
	OAUTH_INTENT,
	OauthIntentService,
} from '#services/auth/oauth_intent_service';

/**
 * The subset of the Ally driver this controller reads after a callback.
 * Depending on the shape rather than on the concrete driver keeps the guards
 * provider-agnostic.
 */
type OauthCallbackState = {
	accessDenied(): boolean;
	stateMisMatch(): boolean;
	hasError(): boolean;
	getError(): string | null;
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

const PROVIDER_LINKED_MESSAGE = 'That sign-in method has been added';

@inject()
export default class AuthController {
	constructor(
		protected readonly sessionService: SessionService,
		protected readonly sudoModeService: SudoModeService,
		protected readonly authEventService: AuthEventService,
		protected readonly oauthIntentService: OauthIntentService,
		protected readonly providerLinkService: ProviderLinkService,
		protected readonly oauthAccountService: OauthAccountService,
		protected readonly googleAuthConfigService: GoogleAuthConfigService
	) {}

	private assertGoogleAuthEnabled() {
		if (!this.googleAuthConfigService.isEnabled) {
			throw new GoogleAuthDisabledException();
		}
	}

	async google(ctx: HttpContext) {
		this.assertGoogleAuthEnabled();

		const redirectUrl = await ctx.ally.use('google').redirectUrl();

		return redirectToOauthProvider(ctx, redirectUrl);
	}

	/**
	 * The single landing route for every Google round trip, because the
	 * callback URL is fixed in the provider's own configuration — a second one
	 * would mean every self-hoster registering a second redirect URI.
	 *
	 * What the returning identity means is therefore decided here: it opens a
	 * session, confirms one, or joins a second sign-in method to an account —
	 * whichever the departing request armed.
	 */
	async callbackAuth(ctx: HttpContext) {
		this.assertGoogleAuthEnabled();

		const google = ctx.ally.use('google');
		// Disarmed first, so an abandoned or failed round trip cannot leave the
		// callback expecting something that never comes.
		const intent = this.oauthIntentService.take(ctx.session);

		const callbackError = this.getCallbackError(google);
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
			default:
				return ctx.response.redirectToNamedRoute('collection.favorites');
		}
	}

	/**
	 * Joins the identity that came back to the account that asked for it. The
	 * departing route sat behind sudo mode, and the intent it armed is spent
	 * here — that single-use flag is what carries the proof across the round
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
		logger.info(`[${user.email}] linked ${identity.provider}`);

		return ctx.response.redirectToNamedRoute('user.settings');
	}

	private async signIn(ctx: HttpContext, identity: OauthIdentity) {
		const user = await this.oauthAccountService.authenticate(identity);

		await ctx.auth.use('web').login(user);
		await this.sessionService.createAuthSession(user);

		await this.authEventService.record({
			type: AUTH_EVENT_TYPE.LOGIN_SUCCEEDED,
			userId: user.id,
			...resolveRequestOrigin(ctx),
		});

		ctx.session.flash('success', 'Successfully authenticated');
		logger.info(`[${user.email}] auth success`);

		// Falls back to the favorites page, but honors an intended URL stashed
		// by AuthMiddleware (e.g. a GET to /extension/authorize?redirect_uri=...
		// hit while logged out) so the extension auth handoff survives a login
		// round-trip instead of stranding on the dashboard.
		return ctx.response.redirect().toIntendedRoute('collection.favorites');
	}

	/**
	 * Accepts the round trip as proof only when the identity that came back is
	 * the one already signed in. Any other Google account — including one
	 * linked to another user here — proves nothing about this session.
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

	private getCallbackError(callback: OauthCallbackState): string | null {
		if (callback.accessDenied()) {
			return 'Access was denied';
		}

		if (callback.stateMisMatch()) {
			return 'Request expired. Retry again';
		}

		if (callback.hasError()) {
			return callback.getError() ?? 'Something went wrong';
		}

		return null;
	}

	async logout({ auth, response, session }: HttpContext) {
		await auth.use('web').logout();
		session.clear();
		session.flash('success', 'Successfully disconnected');
		logger.info(`[${auth.user?.email}] disconnected successfully`);
		response.redirectToNamedRoute('home');
	}
}
