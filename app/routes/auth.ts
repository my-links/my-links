import { middleware } from '#start/kernel';
import router from '@adonisjs/core/services/router';

const AuthController = () => import('#controllers/auth/auth_controller');

const ROUTES_PREFIX = '/auth';

router
	.group(() => {
		router.get('/google', [AuthController, 'google']).as('auth');
		router
			.get('/callback', [AuthController, 'callbackAuth'])
			.as('auth.callback');
	})
	.prefix(ROUTES_PREFIX);

router
	.group(() => {
		router.get('/logout', [AuthController, 'logout']).as('auth.logout');
	})
	.middleware([middleware.auth()])
	.prefix(ROUTES_PREFIX);
