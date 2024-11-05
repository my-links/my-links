import { middleware } from '#start/kernel';
import router from '@adonisjs/core/services/router';
const UsersController = () => import('#controllers/users_controller');

const ROUTES_PREFIX = '/auth';

/**
 * Auth routes for unauthicated users
 */
router
	.group(() => {
		router.get('/google', [UsersController, 'google']).as('auth');
		router
			.get('/callback', [UsersController, 'callbackAuth'])
			.as('auth.callback');
	})
	.prefix(ROUTES_PREFIX);

/**
 * Routes for authenticated users
 */
router
	.group(() => {
		router.get('/logout', [UsersController, 'logout']).as('auth.logout');
	})
	.middleware([middleware.auth()])
	.prefix(ROUTES_PREFIX);
