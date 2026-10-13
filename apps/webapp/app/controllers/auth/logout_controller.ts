import type { HttpContext } from '@adonisjs/core/http';

export default class LogoutController {
	async execute({ auth, logger, response, session }: HttpContext) {
		const userId = auth.user?.id;
		await auth.use('web').logout();
		session.clear();
		session.flash('success', 'Successfully disconnected');
		logger.info({ userId }, 'disconnected successfully');
		response.redirectToNamedRoute('home');
	}
}
