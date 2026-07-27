import router from '@adonisjs/core/services/router';

import { middleware } from '#start/kernel';
import { controllers } from '#generated/controllers';
import {
	loginThrottles,
	registrationThrottles,
	tokenVerificationThrottles,
} from '#start/limiter';

const ROUTES_PREFIX = '/auth';

router
	.group(() => {
		router.get('/login', [controllers.auth.Login, 'render']).as('auth.login');
		router
			.post('/login', [controllers.auth.Login, 'execute'])
			.as('auth.login.submit')
			.use(loginThrottles);

		router
			.get('/register', [controllers.auth.Register, 'render'])
			.as('auth.register');
		router
			.post('/register', [controllers.auth.Register, 'execute'])
			.as('auth.register.submit')
			.use(registrationThrottles);
	})
	.use(middleware.guest({ redirectTo: 'collection.favorites' }));

// Open to guests and to signed-in users alike: a confirmation link is followed
// from a mailbox, and whether its owner happens to have a session at that
// moment says nothing about their right to confirm their own address.
router
	.get('/verify-email/:token', [controllers.auth.VerifyEmail, 'execute'])
	.as('auth.verify-email')
	.use(tokenVerificationThrottles);

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
