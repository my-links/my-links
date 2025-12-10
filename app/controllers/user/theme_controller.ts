import { KEY_USER_THEME } from '#constants/user/theme';
import { updateThemeValidator } from '#validators/user/update_theme_validator';
import type { HttpContext } from '@adonisjs/core/http';

export default class ThemeController {
	async render({ request, session, response }: HttpContext) {
		const { theme } = await request.validateUsing(updateThemeValidator);
		session.put(KEY_USER_THEME, theme);
		return response.ok({ message: 'ok' });
	}
}
