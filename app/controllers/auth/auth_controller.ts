import User from '#models/user';
import type { ApiRouteName } from '#shared/types/index';
import type { HttpContext } from '@adonisjs/core/http';
import logger from '@adonisjs/core/services/logger';
import db from '@adonisjs/lucid/services/db';

export default class AuthController {
	private redirectTo: ApiRouteName = 'home';

	async google({ ally, inertia }: HttpContext) {
		const redirectUrl = await ally.use('google').redirectUrl();
		return inertia.location(redirectUrl);
	}

	async callbackAuth({ ally, auth, response, session }: HttpContext) {
		const google = ally.use('google');
		if (google.accessDenied()) {
			// TODO: translate error messages + show them in UI
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
		session.flash('flash', 'Successfully authenticated');
		logger.info(`[${user.email}] auth success`);

		response.redirectToNamedRoute('collection.favorites');
	}

	async logout({ auth, response, session }: HttpContext) {
		await auth.use('web').logout();
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
