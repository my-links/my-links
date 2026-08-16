import router from '@adonisjs/core/services/router';

import { middleware } from '#start/kernel';
import { controllers } from '#generated/controllers';
import {
	emailChangeRequestThrottles,
	loginThrottles,
	passwordResetRequestThrottles,
	registrationThrottles,
	sudoConfirmationThrottles,
	tokenVerificationThrottles,
	verificationResendThrottles,
} from '#start/limiter';

const ROUTES_PREFIX = '/auth';

const guestOnly = middleware.guest({ redirectTo: 'collection.favorites' });

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

		// Offered by the login page to whoever was just turned away for an
		// unconfirmed address — and open to anyone who lost the first link.
		router
			.post('/resend-verification', [
				controllers.auth.ResendVerification,
				'execute',
			])
			.as('auth.verification.resend')
			.use(verificationResendThrottles);
	})
	.use(guestOnly);

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

// Settling an address change is done from a mailbox — the new one confirms, the
// old one vetoes — so neither link assumes a session. Both carry their token in
// the path, which is why their prefixes are among the ones `toLoggableUrl`
// redacts.
router
	.group(() => {
		router
			.get('/confirm-email-change/:token', [
				controllers.auth.ConfirmEmailChange,
				'execute',
			])
			.as('auth.email.change.confirm');
		router
			.get('/cancel-email-change/:token', [
				controllers.auth.CancelEmailChange,
				'execute',
			])
			.as('auth.email.change.cancel');
	})
	.use(tokenVerificationThrottles);

// Reached mid-login, before a session exists: the password just verified is
// what proves who is asking, not a guest/auth middleware check, so neither
// applies here — same reasoning as the callback route further down.
router.group(() => {
	router
		.get('/reactivate', [controllers.auth.ReactivateAccount, 'render'])
		.as('auth.reactivate');
	router
		.post('/reactivate', [controllers.auth.ReactivateAccount, 'execute'])
		.as('auth.reactivate.submit')
		.use(loginThrottles);
	router
		.post('/reactivate/decline', [
			controllers.auth.ReactivateAccount,
			'decline',
		])
		.as('auth.reactivate.decline');
});

router
	.get('/google', [controllers.auth.GoogleAuth, 'execute'])
	.as('auth')
	.prefix(ROUTES_PREFIX)
	.use(guestOnly);

// Deliberately not behind `guest`: this single callback lands both a sign-in
// and the identity confirmation that a signed-in account without a password
// has to make. The callback URL is fixed in the provider's configuration, so a
// second route would mean every self-hoster registering a second redirect URI.
router
	.get('/callback', [controllers.auth.OauthCallback, 'execute'])
	.as('auth.callback')
	.prefix(ROUTES_PREFIX);

// POST rather than GET: shield guards POST with CSRF, so a third-party page
// can no longer sign the visitor out with an <img src="/auth/logout">.
router
	.post('/logout', [controllers.auth.Logout, 'execute'])
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

		// The address is the account's other credential — it is what a reset link
		// is sent to — so moving it belongs in the same guarded group.
		router
			.post('/email', [controllers.auth.RequestEmailChange, 'execute'])
			.as('auth.email.change')
			.use(emailChangeRequestThrottles);

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
