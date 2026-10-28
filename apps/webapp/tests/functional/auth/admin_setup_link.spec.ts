import router from '@adonisjs/core/services/router';
import { test } from '@japa/runner';

import { buildAdminSetupLink } from '#lib/auth/admin_setup_link';

const APP_URL = 'https://links.example.com';
const SETUP_TOKEN = 'a-setup-token';

test.group('buildAdminSetupLink', () => {
	test('should target the register route carrying the setup token', ({
		assert,
	}) => {
		const link = new URL(buildAdminSetupLink(router, APP_URL, SETUP_TOKEN));
		const matchedRoute = router.match(link.pathname, 'GET', true);

		assert.equal(link.origin, APP_URL);
		assert.equal(link.searchParams.get('setup_token'), SETUP_TOKEN);
		assert.equal(matchedRoute?.route.name, 'auth.register');
	});
});
