import { test } from '@japa/runner';

import { maskIp } from '#lib/network/mask_ip';

test.group('maskIp', () => {
	test('should keep the first three octets of an IPv4 address', ({
		assert,
	}) => {
		assert.equal(maskIp('203.0.113.77'), '203.0.113.0/24');
	});

	test('should keep the first three hextets of an IPv6 address', ({
		assert,
	}) => {
		assert.equal(
			maskIp('2001:db8:abcd:12:34:56:78:9abc'),
			'2001:db8:abcd::/48'
		);
	});

	test('should expand a compressed IPv6 address before masking', ({
		assert,
	}) => {
		assert.equal(maskIp('2001:db8::1'), '2001:db8:0::/48');
	});

	test('should mask the IPv4 inside a dotted IPv4-mapped IPv6 address', ({
		assert,
	}) => {
		assert.equal(maskIp('::ffff:203.0.113.77'), '203.0.113.0/24');
	});

	test('should mask the IPv4 inside a hexadecimal IPv4-mapped IPv6 address', ({
		assert,
	}) => {
		assert.equal(maskIp('::ffff:cb00:714d'), '203.0.113.0/24');
	});

	test('should drop the zone identifier of a link-local IPv6 address', ({
		assert,
	}) => {
		assert.equal(maskIp('fe80::1%eth0'), 'fe80:0:0::/48');
	});

	test('should return null for a null address', ({ assert }) => {
		assert.isNull(maskIp(null));
	});

	test('should return null for an empty address', ({ assert }) => {
		assert.isNull(maskIp(''));
	});

	test('should return null for something that is not an address', ({
		assert,
	}) => {
		assert.isNull(maskIp('not-an-ip'));
	});

	test('should return null for an IPv4 address with an octet out of range', ({
		assert,
	}) => {
		assert.isNull(maskIp('999.0.113.77'));
	});
});
