import { PREFER_DARK_THEME } from '#constants/session';
import { updateUserThemeValidator } from '#validators/user_theme';
import type { HttpContext } from '@adonisjs/core/http';

export default class AppsController {
  index({ inertia }: HttpContext) {
    return inertia.render('home');
  }

  async updateUserTheme({ request, session, response }: HttpContext) {
    const { preferDarkTheme } = await request.validateUsing(
      updateUserThemeValidator
    );
    session.put(PREFER_DARK_THEME, preferDarkTheme);
    return response.ok('ok');
  }
}
