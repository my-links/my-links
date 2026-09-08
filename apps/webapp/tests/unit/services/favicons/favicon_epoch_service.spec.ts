import { test } from '@japa/runner';

import { cache } from '#lib/cache';
import { FaviconEpochService } from '#services/favicons/favicon_epoch_service';

test.group('FaviconEpochService', (group) => {
	group.each.setup(() => cache.namespace('favicon:epoch').clear());

	test('should default to 0 when never bumped', async ({ assert }) => {
		const service = new FaviconEpochService();

		assert.equal(await service.getEpoch(), 0);
	});

	test('should return a new value after bumping', async ({ assert }) => {
		const service = new FaviconEpochService();
		const before = await service.getEpoch();

		await service.bump();

		assert.notEqual(await service.getEpoch(), before);
	});
});
