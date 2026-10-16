import { test } from '@japa/runner';

import {
	parseTrustedProxies,
	resolveTrustProxy,
} from '#lib/network/trusted_proxies';

const KEY = 'TRUSTED_PROXIES';
const UNUSED_HOP_INDEX = 0;

test.group('parseTrustedProxies', () => {
	test('should return nothing when the variable is unset', ({ assert }) => {
		assert.isUndefined(parseTrustedProxies(KEY, undefined));
	});

	test('should return nothing when the variable is blank', ({ assert }) => {
		assert.isUndefined(parseTrustedProxies(KEY, ' , '));
	});

	test('should split and trim a comma-separated list', ({ assert }) => {
		assert.deepEqual(
			parseTrustedProxies(KEY, ' loopback , 172.18.0.2 ,10.0.5.0/24,'),
			['loopback', '172.18.0.2', '10.0.5.0/24']
		);
	});

	test('should reject an entry that is not a name, IP or CIDR range', ({
		assert,
	}) => {
		assert.throws(
			() => parseTrustedProxies(KEY, 'loopback,not-an-address'),
			/TRUSTED_PROXIES entry "not-an-address"/
		);
	});

	test('should reject an out-of-range CIDR prefix', ({ assert }) => {
		assert.throws(
			() => parseTrustedProxies(KEY, '10.0.0.0/99'),
			/TRUSTED_PROXIES entry "10.0.0.0\/99"/
		);
	});
});

test.group('resolveTrustProxy', () => {
	test('should trust the private ranges by default', ({ assert }) => {
		const trustProxy = resolveTrustProxy();

		assert.isTrue(trustProxy('192.168.1.10', UNUSED_HOP_INDEX));
	});

	test('should not trust a public address by default', ({ assert }) => {
		const trustProxy = resolveTrustProxy();

		assert.isFalse(trustProxy('93.184.216.34', UNUSED_HOP_INDEX));
	});

	test('should trust an address inside a configured range', ({ assert }) => {
		const trustProxy = resolveTrustProxy(['172.18.0.0/16']);

		assert.isTrue(trustProxy('172.18.4.2', UNUSED_HOP_INDEX));
	});

	test('should stop trusting default ranges once a list is configured', ({
		assert,
	}) => {
		const trustProxy = resolveTrustProxy(['172.18.0.0/16']);

		assert.isFalse(trustProxy('10.0.0.5', UNUSED_HOP_INDEX));
	});
});
