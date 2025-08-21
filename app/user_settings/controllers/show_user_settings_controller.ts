import { HttpContext } from '@adonisjs/core/http';

export default class ShowUserSettingsController {
	public async render({ auth, inertia }: HttpContext) {
		const user = await auth.authenticate();
		return inertia.render('user_settings/show', {
			user,
		});
	}
}
