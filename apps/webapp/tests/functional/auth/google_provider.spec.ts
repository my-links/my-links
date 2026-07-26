import { test } from '@japa/runner';
import app from '@adonisjs/core/services/app';

import { GoogleAuthConfigService } from '#services/auth/google_auth_config_service';

function disableGoogleAuth() {
	app.container.swap(GoogleAuthConfigService, () => ({ isEnabled: false }));
}

function enableGoogleAuth() {
	app.container.swap(GoogleAuthConfigService, () => ({ isEnabled: true }));
}

test.group('Google auth provider — disabled', (group) => {
	group.each.setup(() => {
		disableGoogleAuth();
		return () => app.container.restore(GoogleAuthConfigService);
	});

	test('should return 404 on the google redirect route when google auth is disabled', async ({
		client,
	}) => {
		const response = await client.get('/auth/google');

		response.assertStatus(404);
	});

	test('should return 404 on the google callback route when google auth is disabled', async ({
		client,
	}) => {
		const response = await client.get('/auth/callback');

		response.assertStatus(404);
	});

	test('should expose a disabled google provider in the inertia shared props', async ({
		client,
	}) => {
		const response = await client.get('/').withInertia();

		response.assertStatus(200);
		response.assertInertiaPropsContains({
			authProviders: { isGoogleEnabled: false },
		});
	});
});

test.group('Google auth provider — enabled', (group) => {
	group.each.setup(() => {
		enableGoogleAuth();
		return () => app.container.restore(GoogleAuthConfigService);
	});

	test('should expose an enabled google provider in the inertia shared props', async ({
		client,
	}) => {
		const response = await client.get('/').withInertia();

		response.assertStatus(200);
		response.assertInertiaPropsContains({
			authProviders: { isGoogleEnabled: true },
		});
	});
});
