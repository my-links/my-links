import { test } from '@japa/runner';
import app from '@adonisjs/core/services/app';
import testUtils from '@adonisjs/core/services/test_utils';

import { FaviconResolutionService } from '#services/favicons/favicon_resolution_service';

test.group('GET /favicon — cache headers', (group) => {
	group.each.setup(() => testUtils.db().wrapInGlobalTransaction());

	test('should never let the browser cache a placeholder — it would hide the real icon once resolved', async ({
		client,
	}) => {
		const url = `https://render-placeholder-test-${Date.now()}.example`;

		const response = await client.get(`/favicon?url=${url}`);

		response.assertHeader('cache-control', 'no-store');
	});

	test('should cache a genuinely resolved favicon for a week', async ({
		client,
	}) => {
		const url = `https://render-resolved-test-${Date.now()}.example`;
		// Cast needed: the real class carries private members a plain double
		// can't structurally satisfy, even though it's a valid runtime
		// substitute here.
		app.container.swap(
			FaviconResolutionService,
			() =>
				({
					getFreshOrStale: () =>
						Promise.resolve({
							buffer: Buffer.from('resolved-bytes'),
							url,
							type: 'image/png',
							size: 14,
						}),
					triggerResolution: () => Promise.resolve(),
					forceRefresh: () => Promise.reject(new Error('not used')),
				}) as unknown as FaviconResolutionService
		);

		const response = await client.get(`/favicon?url=${url}`);

		response.assertHeader('cache-control', 'public, max-age=604800');
	}).teardown(() => app.container.restore(FaviconResolutionService));
});
