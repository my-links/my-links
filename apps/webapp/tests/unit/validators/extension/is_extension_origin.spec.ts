import { test } from '@japa/runner';

import { isExtensionOrigin } from '#validators/extension/is_extension_origin';

const CHROMIUM_ORIGIN = `chrome-extension://${'a'.repeat(32)}`;
const FIREFOX_ORIGIN = 'moz-extension://3f2504e0-4f89-11d3-9a0c-0305e82c3301';

test.group('isExtensionOrigin', () => {
	test('should accept a Chromium extension page origin', ({ assert }) => {
		assert.isTrue(isExtensionOrigin(CHROMIUM_ORIGIN));
	});

	test('should accept a Firefox extension page origin', ({ assert }) => {
		assert.isTrue(isExtensionOrigin(FIREFOX_ORIGIN));
	});

	test('should reject an ordinary web origin', ({ assert }) => {
		assert.isFalse(isExtensionOrigin('https://evil.com'));
	});

	test('should reject a web origin that only mentions an extension scheme in its path', ({
		assert,
	}) => {
		assert.isFalse(isExtensionOrigin('https://evil.com/moz-extension://abc'));
	});

	test('should reject an unparseable origin instead of throwing', ({
		assert,
	}) => {
		assert.isFalse(isExtensionOrigin('not a url'));
	});

	test('should reject the opaque origin browsers send for sandboxed contexts', ({
		assert,
	}) => {
		assert.isFalse(isExtensionOrigin('null'));
	});
});
