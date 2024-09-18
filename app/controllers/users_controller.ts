import User from '#models/user';
import type { HttpContext } from '@adonisjs/core/http';
import logger from '@adonisjs/core/services/logger';
import db from '@adonisjs/lucid/services/db';
import { RouteName } from '@izzyjs/route/types';

const INACTIVE_USER_THRESHOLD = 7;

export default class UsersController {
  private redirectTo: RouteName = 'auth.login';

  login({ inertia }: HttpContext) {
    return inertia.render('login');
  }

  google = ({ ally }: HttpContext) => ally.use('google').redirect();

  async callbackAuth({ ally, auth, response, session }: HttpContext) {
    const google = ally.use('google');
    if (google.accessDenied()) {
      // TODO: translate error messages + show them in UI
      session.flash('flash', 'Access was denied');
      return response.redirectToNamedRoute(this.redirectTo);
    }

    if (google.stateMisMatch()) {
      session.flash('flash', 'Request expired. Retry again');
      return response.redirectToNamedRoute(this.redirectTo);
    }

    if (google.hasError()) {
      session.flash('flash', google.getError() || 'Something went wrong');
      return response.redirectToNamedRoute(this.redirectTo);
    }

    const userCount = await db.from('users').count('* as total');
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
        providerType: 'google',
        isAdmin: userCount[0].total === '0' ? true : undefined,
      }
    );

    await auth.use('web').login(user);
    session.flash('flash', 'Successfully authenticated');
    logger.info(`[${user.email}] auth success`);

    response.redirectToNamedRoute('dashboard');
  }

  async logout({ auth, response, session }: HttpContext) {
    await auth.use('web').logout();
    session.flash('flash', 'Successfully disconnected');
    logger.info(`[${auth.user?.email}] disconnected successfully`);
    response.redirectToNamedRoute(this.redirectTo);
  }

  async getAllUsersWithTotalRelations() {
    return User.query()
      .withCount('collections', (q) => q.as('totalCollections'))
      .withCount('links', (q) => q.as('totalLinks'));
  }

  async getAllInactiveUsers() {
    const users = await this.getAllUsersWithTotalRelations();
    const inactiveUsers = users.filter((user) => {
      const totalLinks = Number(user.$extras.totalLinks);
      const totalCollections = Number(user.$extras.totalCollections);

      const isOlderThan7Days =
        Math.abs(user.updatedAt.diffNow('days').days) > INACTIVE_USER_THRESHOLD;

      return (totalLinks === 0 || totalCollections === 0) && isOlderThan7Days;
    });
    return inactiveUsers ?? [];
  }
}
