import router from '@adonisjs/core/services/router';

import { middleware } from '#start/kernel';
import { loginThrottles } from '#start/limiter';
import { controllers } from '#generated/controllers';

const ROUTES_PREFIX = '/auth';

router
	.group(() => {
		router.get('/login', [controllers.auth.Login, 'render']).as('auth.login');
		router
			.post('/login', [controllers.auth.Login, 'execute'])
			.as('auth.login.submit')
			.use(loginThrottles);
	})
	.use(middleware.guest({ redirectTo: 'collection.favorites' }));

router
	.group(() => {
		router.get('/google', [controllers.auth.Auth, 'google']).as('auth');
		router
			.get('/callback', [controllers.auth.Auth, 'callbackAuth'])
			.as('auth.callback');
	})
	.use(middleware.guest({ redirectTo: 'collection.favorites' }))
	.prefix(ROUTES_PREFIX);

router
	.group(() => {
		router.get('/logout', [controllers.auth.Auth, 'logout']).as('auth.logout');
	})
	.use(middleware.auth())
	.prefix(ROUTES_PREFIX);
