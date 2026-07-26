import { inject } from '@adonisjs/core';
import logger from '@adonisjs/core/services/logger';
import type { HttpContext } from '@adonisjs/core/http';
import type { RoutesList } from '@adonisjs/core/types/http';
import type { AllyUserContract, GoogleToken } from '@adonisjs/ally/types';

import User from '#models/user';
import { AUTH_PROVIDER } from '#constants/auth';
import { SessionService } from '#services/user/session_service';
import { OauthAccountService } from '#services/auth/oauth_account_service';
import { GoogleAuthConfigService } from '#services/auth/google_auth_config_service';
import GoogleAuthDisabledException from '#exceptions/auth/google_auth_disabled_exception';
import OauthAuthenticationRefusedException from '#exceptions/auth/oauth_authentication_refused_exception';

/**
 * Shown for every refusal the OAuth account service raises. The wording must
 * not vary with the reason, or the flash message becomes an account
 * enumeration oracle.
 */
const REFUSED_MESSAGE = 'This Google account cannot be used to sign in';

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
		protected readonly oauthAccountService: OauthAccountService,
		protected readonly googleAuthConfigService: GoogleAuthConfigService
	) {}

	private readonly redirectTo: keyof RoutesList['GET'] = 'home';

	private assertGoogleAuthEnabled() {
		if (!this.googleAuthConfigService.isEnabled) {
			throw new GoogleAuthDisabledException();
		}
	}

	async google({ ally, inertia, request, response }: HttpContext) {
		this.assertGoogleAuthEnabled();

		const redirectUrl = await ally.use('google').redirectUrl();

		if (request.header('x-inertia')) {
			return inertia.location(redirectUrl);
		}

		return response.redirect().toPath(redirectUrl);
	}

	async callbackAuth({ ally, auth, response, session }: HttpContext) {
		this.assertGoogleAuthEnabled();

		const google = ally.use('google');
		const callbackError = this.getCallbackError(google);
		if (callbackError) {
			session.flash('flash', callbackError);
			return response.redirectToNamedRoute(this.redirectTo);
		}

		const user = await this.resolveGoogleAccount(await google.user());
		if (!user) {
			session.flash('flash', REFUSED_MESSAGE);
			return response.redirectToNamedRoute(this.redirectTo);
		}

		await auth.use('web').login(user);
		this.sessionService.createAuthSession(user);

		session.flash('flash', 'Successfully authenticated');
		logger.info(`[${user.email}] auth success`);
		// Falls back to the favorites page, but honors an intended URL stashed
		// by AuthMiddleware (e.g. a GET to /extension/authorize?redirect_uri=...
		// hit while logged out) so the extension auth handoff survives a login
		// round-trip instead of stranding on the dashboard.
		response.redirect().toIntendedRoute('collection.favorites');
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

	private async resolveGoogleAccount(
		googleUser: AllyUserContract<GoogleToken>
	): Promise<User | null> {
		try {
			return await this.oauthAccountService.authenticate({
				provider: AUTH_PROVIDER.GOOGLE,
				providerUserId: googleUser.id,
				email: googleUser.email,
				isEmailVerified: googleUser.emailVerificationState === 'verified',
				name: googleUser.name,
				nickName: googleUser.nickName,
				avatarUrl: googleUser.avatarUrl,
			});
		} catch (error) {
			if (error instanceof OauthAuthenticationRefusedException) {
				logger.warn(`google auth refused (${error.reason})`);
				return null;
			}

			throw error;
		}
	}

	async logout({ auth, response, session }: HttpContext) {
		await auth.use('web').logout();
		session.clear();
		session.flash('flash', 'Successfully disconnected');
		logger.info(`[${auth.user?.email}] disconnected successfully`);
		response.redirectToNamedRoute('home');
	}

	async getAllUsersWithTotalRelations() {
		return User.query()
			.withCount('collections', (q) => {
				q.as('totalCollections');
			})
			.withCount('links', (q) => {
				q.as('totalLinks');
			});
	}
}
