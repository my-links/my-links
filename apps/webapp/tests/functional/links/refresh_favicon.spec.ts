import { test } from '@japa/runner';
import app from '@adonisjs/core/services/app';
import testUtils from '@adonisjs/core/services/test_utils';

import type { Favicon } from '#types/favicon_type';
import { createLink } from '#tests/factories/link_factory';
import { createUser } from '#tests/factories/user_factory';
import FaviconNotFoundException from '#exceptions/favicons/favicon_not_found_exception';
import { FaviconResolutionService } from '#services/favicons/favicon_resolution_service';

const FAVORITES_ROUTE = '/collections/favorites';

// Cast needed: the real class carries private members a plain double can't
// structurally satisfy, even though it's a valid runtime substitute here.
function swapResolutionService(favicon: Favicon | Error) {
	app.container.swap(
		FaviconResolutionService,
		() =>
			({
				getFreshOrStale: () =>
					Promise.reject(new Error('not used in this test')),
				triggerResolution: () => Promise.resolve(),
				forceRefresh: () =>
					favicon instanceof Error
						? Promise.reject(favicon)
						: Promise.resolve(favicon),
			}) as unknown as FaviconResolutionService
	);
}

test.group('Refresh link favicon', (group) => {
	group.each.setup(() => testUtils.db().wrapInGlobalTransaction());

	test('should force a fresh resolution and redirect back', async ({
		client,
	}) => {
		const user = await createUser({ emailPrefix: 'refresh-favicon-owner' });
		const link = await createLink({
			author: user,
			url: 'https://refresh-favicon-success.example',
		});
		swapResolutionService({
			buffer: Buffer.from('fresh-bytes'),
			url: link.url,
			type: 'image/x-icon',
			size: 11,
		});

		const response = await client
			.post(`/links/${link.id}/favicon/refresh`)
			.withCsrfToken()
			.loginAs(user)
			.redirects(0);

		response.assertStatus(302);
		response.assertFlashMessage('success', 'Favicon refreshed');
	}).teardown(() => app.container.restore(FaviconResolutionService));

	test("should reject refreshing another user's link", async ({ client }) => {
		const owner = await createUser({ emailPrefix: 'refresh-favicon-owner-2' });
		const intruder = await createUser({
			emailPrefix: 'refresh-favicon-intruder',
		});
		const link = await createLink({
			author: owner,
			url: 'https://refresh-favicon-foreign.example',
		});

		const response = await client
			.post(`/links/${link.id}/favicon/refresh`)
			.withCsrfToken()
			.loginAs(intruder)
			.redirects(0);

		response.assertHeader('location', FAVORITES_ROUTE);
	});

	test('should flash an error and redirect back when resolution fails', async ({
		client,
	}) => {
		const user = await createUser({ emailPrefix: 'refresh-favicon-failure' });
		const link = await createLink({
			author: user,
			url: 'https://refresh-favicon-failure.example',
		});
		swapResolutionService(new FaviconNotFoundException('no icon there'));

		const response = await client
			.post(`/links/${link.id}/favicon/refresh`)
			.withCsrfToken()
			.loginAs(user)
			.redirects(0);

		response.assertStatus(302);
		response.assertFlashMessage(
			'error',
			'No favicon could be found for that link'
		);
	}).teardown(() => app.container.restore(FaviconResolutionService));
});
