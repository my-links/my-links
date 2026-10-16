import { test } from '@japa/runner';

import { EXTENSION_BROWSER } from '#constants/extension';
import { resolveExtensionBrowser } from '#validators/extension/resolve_extension_browser';
import {
	hashFirefoxAddonId,
	resolveAllowedExtensionHosts,
} from '#lib/extension/extension_ids';

const OFFICIAL_CHROMIUM_ID = 'agkmlplihacolkakgeccnbhphnepphma';
const OFFICIAL_FIREFOX_HASH = '90c2f297f278cfdc2226b3d46282e1426576dd95';
const OTHER_CHROMIUM_ID = 'a'.repeat(32);
const allowedHosts = resolveAllowedExtensionHosts();

test.group('resolveExtensionBrowser', () => {
	test('should accept the official Chromium callback', ({ assert }) => {
		assert.equal(
			resolveExtensionBrowser(
				`https://${OFFICIAL_CHROMIUM_ID}.chromiumapp.org/`,
				allowedHosts
			),
			EXTENSION_BROWSER.CHROMIUM
		);
	});

	test('should accept the official Chromium callback with a path', ({
		assert,
	}) => {
		assert.equal(
			resolveExtensionBrowser(
				`https://${OFFICIAL_CHROMIUM_ID}.chromiumapp.org/callback`,
				allowedHosts
			),
			EXTENSION_BROWSER.CHROMIUM
		);
	});

	test('should accept the official Firefox callback', ({ assert }) => {
		assert.equal(
			resolveExtensionBrowser(
				`https://${OFFICIAL_FIREFOX_HASH}.extensions.allizom.org/`,
				allowedHosts
			),
			EXTENSION_BROWSER.FIREFOX
		);
	});

	test('should refuse a well-formed Chromium callback of another extension', ({
		assert,
	}) => {
		assert.isNull(
			resolveExtensionBrowser(
				`https://${OTHER_CHROMIUM_ID}.chromiumapp.org/`,
				allowedHosts
			)
		);
	});

	test('should refuse a well-formed Firefox callback of another add-on', ({
		assert,
	}) => {
		assert.isNull(
			resolveExtensionBrowser(
				`https://${'a'.repeat(40)}.extensions.allizom.org/`,
				allowedHosts
			)
		);
	});

	test('should accept the callback of an extension id added by configuration', ({
		assert,
	}) => {
		const hosts = resolveAllowedExtensionHosts([OTHER_CHROMIUM_ID]);

		assert.equal(
			resolveExtensionBrowser(
				`https://${OTHER_CHROMIUM_ID}.chromiumapp.org/`,
				hosts
			),
			EXTENSION_BROWSER.CHROMIUM
		);
	});

	test('should accept the callback of a Firefox add-on id added by configuration', ({
		assert,
	}) => {
		const addonId = 'dev-build@example.com';
		const hosts = resolveAllowedExtensionHosts([addonId]);

		assert.equal(
			resolveExtensionBrowser(
				`https://${hashFirefoxAddonId(addonId)}.extensions.allizom.org/`,
				hosts
			),
			EXTENSION_BROWSER.FIREFOX
		);
	});

	test('should refuse http even on an allowed host', ({ assert }) => {
		assert.isNull(
			resolveExtensionBrowser(
				`http://${OFFICIAL_CHROMIUM_ID}.chromiumapp.org/`,
				allowedHosts
			)
		);
	});

	test('should refuse an allowed host carrying a port', ({ assert }) => {
		assert.isNull(
			resolveExtensionBrowser(
				`https://${OFFICIAL_CHROMIUM_ID}.chromiumapp.org:8443/`,
				allowedHosts
			)
		);
	});

	test('should refuse credentials smuggled in front of an allowed host', ({
		assert,
	}) => {
		assert.isNull(
			resolveExtensionBrowser(
				`https://evil.example.com@${OFFICIAL_CHROMIUM_ID}.chromiumapp.org/`,
				allowedHosts
			)
		);
	});

	test('should refuse an allowed host that only appears in the path', ({
		assert,
	}) => {
		assert.isNull(
			resolveExtensionBrowser(
				`https://evil.com/${OFFICIAL_CHROMIUM_ID}.chromiumapp.org/`,
				allowedHosts
			)
		);
	});

	test('should refuse an attacker host suffixing an allowed host', ({
		assert,
	}) => {
		assert.isNull(
			resolveExtensionBrowser(
				`https://${OFFICIAL_FIREFOX_HASH}.extensions.allizom.org.evil.com/`,
				allowedHosts
			)
		);
	});
});
