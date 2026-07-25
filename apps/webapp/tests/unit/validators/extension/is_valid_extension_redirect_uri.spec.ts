import { test } from '@japa/runner';

import { isValidExtensionRedirectUri } from '#validators/extension/is_valid_extension_redirect_uri';

const VALID_EXTENSION_ID = 'a'.repeat(32);
/** Firefox hashes the add-on id with SHA-1, so its subdomain is 40 hex chars. */
const VALID_ADDON_ID_HASH = '0123456789abcdef'.repeat(3).slice(0, 40);

test.group('isValidExtensionRedirectUri', () => {
	test('should accept a bare chromiumapp.org callback for the extension id', ({
		assert,
	}) => {
		assert.isTrue(
			isValidExtensionRedirectUri(
				`https://${VALID_EXTENSION_ID}.chromiumapp.org/`
			)
		);
	});

	test('should accept a chromiumapp.org callback with a path', ({ assert }) => {
		assert.isTrue(
			isValidExtensionRedirectUri(
				`https://${VALID_EXTENSION_ID}.chromiumapp.org/callback`
			)
		);
	});

	test('should reject a non-chromiumapp.org origin', ({ assert }) => {
		assert.isFalse(
			isValidExtensionRedirectUri(`https://${VALID_EXTENSION_ID}.evil.com/`)
		);
	});

	test('should reject http (non-https) even on a valid host', ({ assert }) => {
		assert.isFalse(
			isValidExtensionRedirectUri(
				`http://${VALID_EXTENSION_ID}.chromiumapp.org/`
			)
		);
	});

	test('should reject an extension id containing invalid characters', ({
		assert,
	}) => {
		assert.isFalse(
			isValidExtensionRedirectUri(`https://${'a'.repeat(31)}Z.chromiumapp.org/`)
		);
	});

	test('should reject an extension id of the wrong length', ({ assert }) => {
		assert.isFalse(
			isValidExtensionRedirectUri(`https://${'a'.repeat(10)}.chromiumapp.org/`)
		);
	});

	test('should reject an attacker host with chromiumapp.org only in the path', ({
		assert,
	}) => {
		assert.isFalse(
			isValidExtensionRedirectUri(
				`https://evil.com/${VALID_EXTENSION_ID}.chromiumapp.org/`
			)
		);
	});

	test('should accept a bare extensions.allizom.org callback for the add-on hash', ({
		assert,
	}) => {
		assert.isTrue(
			isValidExtensionRedirectUri(
				`https://${VALID_ADDON_ID_HASH}.extensions.allizom.org/`
			)
		);
	});

	test('should accept an extensions.allizom.org callback with a path', ({
		assert,
	}) => {
		assert.isTrue(
			isValidExtensionRedirectUri(
				`https://${VALID_ADDON_ID_HASH}.extensions.allizom.org/callback`
			)
		);
	});

	test('should reject an add-on hash of the wrong length', ({ assert }) => {
		assert.isFalse(
			isValidExtensionRedirectUri(
				`https://${'a'.repeat(32)}.extensions.allizom.org/`
			)
		);
	});

	test('should reject an add-on hash containing non-hexadecimal characters', ({
		assert,
	}) => {
		assert.isFalse(
			isValidExtensionRedirectUri(
				`https://${'z'.repeat(40)}.extensions.allizom.org/`
			)
		);
	});

	test('should reject an attacker host that only suffixes allizom.org', ({
		assert,
	}) => {
		assert.isFalse(
			isValidExtensionRedirectUri(
				`https://${VALID_ADDON_ID_HASH}.extensions.allizom.org.evil.com/`
			)
		);
	});
});
