import { inject } from '@adonisjs/core';
import logger from '@adonisjs/core/services/logger';
import type { HttpContext } from '@adonisjs/core/http';
import type { RoutesList } from '@adonisjs/core/types/http';

import type User from '#models/user';
import { SessionService } from '#services/user/session_service';
import { AUTH_EVENT_TYPE, AUTH_PROVIDER } from '#constants/auth';
import { redirectToOauthProvider } from '#lib/auth/oauth_redirect';
import { SudoModeService } from '#services/auth/sudo_mode_service';
import { AuthEventService } from '#services/auth/auth_event_service';
import { resolveAuthEventOrigin } from '#lib/auth/auth_event_origin';
import type { OauthIdentity } from '#services/auth/oauth_account_service';
import { OauthAccountService } from '#services/auth/oauth_account_service';
import { GoogleAuthConfigService } from '#services/auth/google_auth_config_service';
import GoogleAuthDisabledException from '#exceptions/auth/google_auth_disabled_exception';

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

@inject()
export default class AuthController {
	constructor(
		protected readonly sessionService: SessionService,
		protected readonly sudoModeService: SudoModeService,
		protected readonly authEventService: AuthEventService,
		protected readonly oauthAccountService: OauthAccountService,
		protected readonly googleAuthConfigService: GoogleAuthConfigService
	) {}

	private readonly redirectTo: keyof RoutesList['GET'] = 'home';

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
	 * What the returning identity means is therefore decided here: it confirms
	 * a session that armed the flag before leaving, or it opens one.
	 */
	async callbackAuth(ctx: HttpContext) {
		this.assertGoogleAuthEnabled();

		const google = ctx.ally.use('google');
		// Disarmed first, so an abandoned or failed round trip cannot leave the
		// callback expecting a confirmation that never comes.
		const isSudoConfirmation =
			this.sudoModeService.takePendingOauthConfirmation(ctx.session);

		const callbackError = this.getCallbackError(google);
		if (callbackError) {
			ctx.session.flash('error', callbackError);

			return ctx.response.redirectToNamedRoute(
				isSudoConfirmation ? 'auth.sudo' : this.redirectTo
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
			avatarUrl: googleUser.avatarUrl,
		};

		const signedInUser = ctx.auth.user;

		// The flag alone is not enough: somebody who armed a confirmation, walked
		// away and came back signed out is starting a plain sign-in, and must not
		// be met with an authentication error for it.
		if (isSudoConfirmation && signedInUser) {
			return this.confirmIdentity(ctx, identity, signedInUser);
		}

		// Stands in for the guest middleware the route cannot carry any more:
		// an already signed-in visitor landing here without having armed a
		// confirmation is starting a sign-in they do not need.
		if (signedInUser) {
			return ctx.response.redirectToNamedRoute('collection.favorites');
		}

		return this.signIn(ctx, identity);
	}

	private async signIn(ctx: HttpContext, identity: OauthIdentity) {
		const user = await this.oauthAccountService.authenticate(identity);

		await ctx.auth.use('web').login(user);
		this.sessionService.createAuthSession(user);

		await this.authEventService.record({
			type: AUTH_EVENT_TYPE.LOGIN_SUCCEEDED,
			userId: user.id,
			...resolveAuthEventOrigin(ctx),
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
			origin: resolveAuthEventOrigin(ctx),
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
