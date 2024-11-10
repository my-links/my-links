import { middleware } from '#start/kernel';
import router from '@adonisjs/core/services/router';
const AuthController = () => import('#auth/controllers/auth_controller');

const ROUTES_PREFIX = '/auth';

/**
 * Auth routes for unauthicated users
 */
router
	.group(() => {
		router.get('/google', [AuthController, 'google']).as('auth');
		router
			.get('/callback', [AuthController, 'callbackAuth'])
			.as('auth.callback');
	})
	.prefix(ROUTES_PREFIX);

/**
 * Routes for authenticated users
 */
router
	.group(() => {
		router.get('/logout', [AuthController, 'logout']).as('auth.logout');
	})
	.middleware([middleware.auth()])
	.prefix(ROUTES_PREFIX);
