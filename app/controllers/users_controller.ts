import PATHS from '#constants/paths';
import User from '#models/user';
import type { HttpContext } from '@adonisjs/core/http';
import logger from '@adonisjs/core/services/logger';

export default class UsersController {
  private redirectTo = PATHS.HOME;

  login({ inertia }: HttpContext) {
    return inertia.render('login');
  }

  google = ({ ally }: HttpContext) => ally.use('google').redirect();

  async callbackAuth({ ally, auth, response, session }: HttpContext) {
    const google = ally.use('google');
    if (google.accessDenied()) {
      // TODO: translate error messages + show them in UI
      session.flash('flash', 'Access was denied');
      return response.redirect(this.redirectTo);
    }

    if (google.stateMisMatch()) {
      session.flash('flash', 'Request expired. Retry again');
      return response.redirect(this.redirectTo);
    }

    if (google.hasError()) {
      session.flash('flash', google.getError() || 'Something went wrong');
      return response.redirect(this.redirectTo);
    }

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
      }
    );

    await auth.use('web').login(user);
    session.flash('flash', 'Successfully authenticated');
    logger.info(`[${user.email}] auth success`);

    response.redirect(PATHS.DASHBOARD);
  }

  async logout({ auth, response, session }: HttpContext) {
    await auth.use('web').logout();
    session.flash('flash', 'Successfully disconnected');
    logger.info(`[${auth.user?.email}] disconnected successfully`);
    response.redirect(this.redirectTo);
  }
}
