import { test } from '@japa/runner';

import { OFFICIAL_FIREFOX_ADDON_ID } from '#constants/extension';
import {
	hashFirefoxAddonId,
	parseExtensionIds,
} from '#lib/extension/extension_ids';
import { InvalidExtensionIdsConfigException } from '#exceptions/extension/invalid_extension_ids_config_exception';

const KEY = 'EXTENSION_IDS';

test.group('hashFirefoxAddonId', () => {
	test('should hash the official add-on id to its known callback subdomain', ({
		assert,
	}) => {
		assert.equal(
			hashFirefoxAddonId(OFFICIAL_FIREFOX_ADDON_ID),
			'90c2f297f278cfdc2226b3d46282e1426576dd95'
		);
	});
});

test.group('parseExtensionIds', () => {
	test('should return no ids when the variable is unset', ({ assert }) => {
		assert.deepEqual(parseExtensionIds(KEY, undefined), []);
	});

	test('should split and trim a comma-separated list', ({ assert }) => {
		assert.deepEqual(
			parseExtensionIds(KEY, ` ${'a'.repeat(32)} , dev@example.com ,`),
			['a'.repeat(32), 'dev@example.com']
		);
	});

	test('should refuse an entry that is neither a Chromium id nor an add-on id', ({
		assert,
	}) => {
		assert.throws(
			() => parseExtensionIds(KEY, 'not-an-id'),
			InvalidExtensionIdsConfigException
		);
	});

	test('should refuse a Chromium id of the wrong length', ({ assert }) => {
		assert.throws(
			() => parseExtensionIds(KEY, 'a'.repeat(31)),
			InvalidExtensionIdsConfigException
		);
	});
});
