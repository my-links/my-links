import User from '#models/user';
import { SessionService } from '#services/user/session_service';
import { inject } from '@adonisjs/core';
import type { HttpContext } from '@adonisjs/core/http';
import logger from '@adonisjs/core/services/logger';
import type { RoutesList } from '@adonisjs/core/types/http';
import db from '@adonisjs/lucid/services/db';

@inject()
export default class AuthController {
	constructor(protected readonly sessionService: SessionService) {}

	private readonly redirectTo: keyof RoutesList['GET'] = 'home';

	async google({ ally, inertia, request, response }: HttpContext) {
		const redirectUrl = await ally.use('google').redirectUrl();

		if (request.header('x-inertia')) {
			return inertia.location(redirectUrl);
		}

		return response.redirect().toPath(redirectUrl);
	}

	async callbackAuth({ ally, auth, response, session }: HttpContext) {
		const google = ally.use('google');
		if (google.accessDenied()) {
			session.flash('flash', 'Access was denied');
			return response.redirectToNamedRoute(this.redirectTo);
		}

		if (google.stateMisMatch()) {
			session.flash('flash', 'Request expired. Retry again');
			return response.redirectToNamedRoute(this.redirectTo);
		}

		if (google.hasError()) {
			session.flash('flash', google.getError() || 'Something went wrong');
			return response.redirectToNamedRoute(this.redirectTo);
		}

		const userCount = await db.from('users').count('* as total');
		const {
			email,
			id: providerId,
			name,
			nickName,
			avatarUrl,
			token,
		} = await google.user();
		const user = await User.updateOrCreate(
			{
				email,
			},
			{
				email,
				providerId,
				name,
				nickName,
				avatarUrl,
				token,
				providerType: 'google',
				isAdmin: userCount[0].total === '0' ? true : undefined,
			}
		);

		await auth.use('web').login(user);
		this.sessionService.createAuthSession(user);

		session.flash('flash', 'Successfully authenticated');
		logger.info(`[${user.email}] auth success`);
		response.redirectToNamedRoute('collection.favorites');
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
			.withCount('collections', (q) => q.as('totalCollections'))
			.withCount('links', (q) => q.as('totalLinks'));
	}
}
