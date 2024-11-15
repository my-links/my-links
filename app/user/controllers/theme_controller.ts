import { KEY_USER_THEME } from '#user/constants/theme';
import { updateThemeValidator } from '#user/validators/update_theme_validator';
import type { HttpContext } from '@adonisjs/core/http';

export default class ThemeController {
	async index({ request, session, response }: HttpContext) {
		const { theme } = await request.validateUsing(updateThemeValidator);
		session.put(KEY_USER_THEME, theme);
		return response.ok({ message: 'ok' });
	}
}
