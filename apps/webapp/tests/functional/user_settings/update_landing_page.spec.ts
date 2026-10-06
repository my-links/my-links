import { test } from '@japa/runner';
import testUtils from '@adonisjs/core/services/test_utils';

import { createUser } from '#tests/factories/user_factory';
import { LANDING_PAGE, type LandingPage } from '#enums/dashboard/landing_page';

const LANDING_PAGE_ROUTE = '/user/settings/landing-page';
const SETTINGS_ROUTE = '/user/settings';

test.group('Update landing page', (group) => {
	group.each.setup(() => testUtils.db().wrapInGlobalTransaction());

	test('should save the default landing page', async ({ assert, client }) => {
		const user = await createUser({ emailPrefix: 'landing-page' });

		const response = await client
			.put(LANDING_PAGE_ROUTE)
			.form({ defaultLandingPage: LANDING_PAGE.INBOX })
			.withCsrfToken()
			.loginAs(user)
			.redirects(0);

		await user.refresh();
		assert.equal(user.defaultLandingPage, LANDING_PAGE.INBOX);
		response.assertHeader('location', SETTINGS_ROUTE);
	});

	test('should reject an unknown landing page', async ({ assert, client }) => {
		const user = await createUser({ emailPrefix: 'landing-page-unknown' });

		await client
			.put(LANDING_PAGE_ROUTE)
			.form({ defaultLandingPage: 'nope' as LandingPage })
			.withCsrfToken()
			.loginAs(user)
			.redirects(0);

		await user.refresh();
		assert.equal(user.defaultLandingPage, LANDING_PAGE.FAVORITES);
	});
});
