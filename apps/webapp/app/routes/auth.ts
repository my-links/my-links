import router from '@adonisjs/core/services/router';

import { middleware } from '#start/kernel';
import { controllers } from '#generated/controllers';
import {
	loginThrottles,
	passwordResetRequestThrottles,
	registrationThrottles,
	sudoConfirmationThrottles,
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

		router
			.get('/forgot-password', [
				controllers.auth.RequestPasswordReset,
				'render',
			])
			.as('auth.password.forgot');
		router
			.post('/forgot-password', [
				controllers.auth.RequestPasswordReset,
				'execute',
			])
			.as('auth.password.forgot.submit')
			.use(passwordResetRequestThrottles);
	})
	.use(middleware.guest({ redirectTo: 'collection.favorites' }));

// Open to guests and to signed-in users alike: a confirmation link is followed
// from a mailbox, and whether its owner happens to have a session at that
// moment says nothing about their right to confirm their own address.
router
	.get('/verify-email/:token', [controllers.auth.VerifyEmail, 'execute'])
	.as('auth.verify-email')
	.use(tokenVerificationThrottles);

// Reset links are followed from a mailbox too. Both routes carry the token in
// their path, which is why `/reset-password/` is one of the prefixes
// `toLoggableUrl` redacts.
router
	.group(() => {
		router
			.get('/:token', [controllers.auth.ResetPassword, 'render'])
			.as('auth.password.reset');
		router
			.post('/:token', [controllers.auth.ResetPassword, 'execute'])
			.as('auth.password.reset.submit');
	})
	.prefix('/reset-password')
	.use(tokenVerificationThrottles);

router
	.get('/google', [controllers.auth.Auth, 'google'])
	.as('auth')
	.prefix(ROUTES_PREFIX)
	.use(middleware.guest({ redirectTo: 'collection.favorites' }));

// Deliberately not behind `guest`: this single callback lands both a sign-in
// and the identity confirmation that a signed-in account without a password
// has to make. The callback URL is fixed in the provider's configuration, so a
// second route would mean every self-hoster registering a second redirect URI.
router
	.get('/callback', [controllers.auth.Auth, 'callbackAuth'])
	.as('auth.callback')
	.prefix(ROUTES_PREFIX);

router
	.get('/logout', [controllers.auth.Auth, 'logout'])
	.as('auth.logout')
	.prefix(ROUTES_PREFIX)
	.use(middleware.auth());

// The prompt sudo mode redirects to, so it is reachable while merely signed in
// — guarding it with sudo mode would be a loop.
router
	.group(() => {
		router.get('/sudo', [controllers.auth.SudoMode, 'render']).as('auth.sudo');
		router
			.post('/sudo', [controllers.auth.SudoMode, 'execute'])
			.as('auth.sudo.submit')
			.use(sudoConfirmationThrottles);

		router
			.get('/sudo/google', [controllers.auth.SudoModeGoogle, 'execute'])
			.as('auth.sudo.google');
	})
	.use(middleware.auth());

// Managing a password is what an intruder holding an abandoned session would
// reach for first, so both writes sit behind a recent proof of identity.
router
	.group(() => {
		router
			.post('/password', [controllers.auth.SetPassword, 'execute'])
			.as('auth.password.set');
		router
			.put('/password', [controllers.auth.ChangePassword, 'execute'])
			.as('auth.password.change');

		// Adding or removing a way into the account is the same class of
		// operation as replacing its password, and the anti-lockout guard in
		// `ProviderLinkService` is what makes the removal safe rather than the
		// button the settings page decides to hide.
		router
			.get('/providers/google', [controllers.auth.LinkProvider, 'execute'])
			.as('auth.provider.google.link');
		router
			.delete('/providers/:provider', [
				controllers.auth.UnlinkProvider,
				'execute',
			])
			.as('auth.provider.unlink');
	})
	.prefix('/account')
	.use([middleware.auth(), middleware.sudo()]);
