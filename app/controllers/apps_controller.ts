import { PREFER_DARK_THEME } from '#constants/session';
import { updateUserThemeValidator } from '#validators/user';
import type { HttpContext } from '@adonisjs/core/http';

export default class AppsController {
	async updateUserTheme({ request, session, response }: HttpContext) {
		const { preferDarkTheme } = await request.validateUsing(
			updateUserThemeValidator
		);
		session.put(PREFER_DARK_THEME, preferDarkTheme);
		return response.ok({ message: 'ok' });
	}
}
