import logger from '@adonisjs/core/services/logger';
import type { HttpContext } from '@adonisjs/core/http';

export default class LogoutController {
	async execute({ auth, response, session }: HttpContext) {
		await auth.use('web').logout();
		session.clear();
		session.flash('success', 'Successfully disconnected');
		logger.info(`[${auth.user?.email}] disconnected successfully`);
		response.redirectToNamedRoute('home');
	}
}
