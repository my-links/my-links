import { PREFER_DARK_THEME } from '#user/constants/theme';
import { updateThemeValidator } from '#user/validators/update_theme_validator';
import type { HttpContext } from '@adonisjs/core/http';

export default class ThemeController {
	async index({ request, session, response }: HttpContext) {
		const { preferDarkTheme } =
			await request.validateUsing(updateThemeValidator);
		session.put(PREFER_DARK_THEME, preferDarkTheme);
		return response.ok({ message: 'ok' });
	}
}
