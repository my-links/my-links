import type { HttpContext } from '@adonisjs/core/http';

export default class HomeController {
	async render({ auth, inertia, response }: HttpContext) {
		if (await auth.use(auth.defaultGuard).check()) {
			return response.redirect().toRoute('collection.favorites');
		}

		return inertia.render('home', {});
	}
}
