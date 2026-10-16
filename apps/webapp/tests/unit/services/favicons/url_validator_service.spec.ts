import { test } from '@japa/runner';

import { UrlValidatorService } from '#services/favicons/url_validator_service';

function validatorResolvingTo(
	records: Record<string, { address: string; family: number }[]>
) {
	return new UrlValidatorService(async (hostname) => records[hostname] ?? []);
}

test.group('UrlValidatorService.isUrlAllowed', () => {
	test('should allow a public hostname resolving to a public IP', async ({
		assert,
	}) => {
		const validator = validatorResolvingTo({
			'example.com': [{ address: '93.184.216.34', family: 4 }],
		});

		assert.isTrue(await validator.isUrlAllowed('https://example.com/page'));
	});

	test('should block non-http(s) schemes', async ({ assert }) => {
		const validator = validatorResolvingTo({});

		assert.isFalse(await validator.isUrlAllowed('file:///etc/passwd'));
	});

	test('should block a loopback address outside 127.0.0.1', async ({
		assert,
	}) => {
		const validator = validatorResolvingTo({
			'127.0.0.2': [{ address: '127.0.0.2', family: 4 }],
		});

		assert.isFalse(await validator.isUrlAllowed('http://127.0.0.2/'));
	});

	test('should block decimal-encoded loopback IPs once resolved', async ({
		assert,
	}) => {
		const validator = validatorResolvingTo({
			'2130706433': [{ address: '127.0.0.1', family: 4 }],
		});

		assert.isFalse(await validator.isUrlAllowed('http://2130706433/'));
	});

	test('should block the IPv4-mapped cloud metadata address', async ({
		assert,
	}) => {
		const validator = validatorResolvingTo({
			'::ffff:a9fe:a9fe': [{ address: '::ffff:a9fe:a9fe', family: 6 }],
		});

		assert.isFalse(await validator.isUrlAllowed('http://[::ffff:a9fe:a9fe]/'));
	});

	test('should block internal Docker hostnames resolving to a private IP', async ({
		assert,
	}) => {
		const validator = validatorResolvingTo({
			postgres: [{ address: '172.18.0.3', family: 4 }],
		});

		assert.isFalse(await validator.isUrlAllowed('http://postgres:5432/'));
	});

	test('should block non-FQDN hostnames before resolving them', async ({
		assert,
	}) => {
		const validator = validatorResolvingTo({
			internalservice: [{ address: '93.184.216.34', family: 4 }],
		});

		assert.isFalse(await validator.isUrlAllowed('http://internalservice/'));
	});

	test('should block a public host that redirects nowhere yet resolves privately', async ({
		assert,
	}) => {
		const validator = validatorResolvingTo({
			'metadata.example': [{ address: '169.254.169.254', family: 4 }],
		});

		assert.isFalse(await validator.isUrlAllowed('http://metadata.example/'));
	});

	test('should block an unresolvable hostname', async ({ assert }) => {
		const validator = validatorResolvingTo({});

		assert.isFalse(
			await validator.isUrlAllowed('http://does-not-exist.example/')
		);
	});
});

test.group('UrlValidatorService.checkUrl', () => {
	test('should report an unresolvable hostname as unresolvable', async ({
		assert,
	}) => {
		const validator = validatorResolvingTo({});

		assert.equal(
			await validator.checkUrl('http://does-not-exist.example/'),
			'unresolvable'
		);
	});

	test('should report a private address as blocked', async ({ assert }) => {
		const validator = validatorResolvingTo({
			'metadata.example': [{ address: '169.254.169.254', family: 4 }],
		});

		assert.equal(
			await validator.checkUrl('http://metadata.example/'),
			'blocked'
		);
	});

	test('should report a local domain as blocked', async ({ assert }) => {
		const validator = validatorResolvingTo({});

		assert.equal(await validator.checkUrl('http://nas.local/'), 'blocked');
	});

	test('should report a public address as allowed', async ({ assert }) => {
		const validator = validatorResolvingTo({
			'example.com': [{ address: '93.184.216.34', family: 4 }],
		});

		assert.equal(await validator.checkUrl('https://example.com/'), 'allowed');
	});
});

test.group('UrlValidatorService.assertUrlAllowed', () => {
	test('should throw a message without the URL when the target is blocked', async ({
		assert,
	}) => {
		const validator = validatorResolvingTo({});

		const error = await validator
			.assertUrlAllowed('http://secret-intranet.local/page')
			.catch((thrown: Error) => thrown);

		assert.notInclude((error as Error).message, 'secret-intranet');
	});

	test('should throw a message without the URL when the host cannot be resolved', async ({
		assert,
	}) => {
		const validator = validatorResolvingTo({});

		const error = await validator
			.assertUrlAllowed('https://unknown-host.example.org/page')
			.catch((thrown: Error) => thrown);

		assert.notInclude((error as Error).message, 'unknown-host');
	});
});

test.group('UrlValidatorService: non-public address ranges', () => {
	const blockedLiterals = [
		{ literal: '[::]', family: 6, address: '::' },
		{ literal: '[::127.0.0.1]', family: 6, address: '::7f00:1' },
		{ literal: '[64:ff9b::7f00:1]', family: 6, address: '64:ff9b::7f00:1' },
		{ literal: '[2002:7f00:1::]', family: 6, address: '2002:7f00:1::' },
		{ literal: '[100::1]', family: 6, address: '100::1' },
		{ literal: '[ff02::1]', family: 6, address: 'ff02::1' },
		{ literal: '[::ffff:127.0.0.1]', family: 6, address: '::ffff:7f00:1' },
		{ literal: '100.64.0.1', family: 4, address: '100.64.0.1' },
		{ literal: '192.0.0.1', family: 4, address: '192.0.0.1' },
		{ literal: '198.18.0.1', family: 4, address: '198.18.0.1' },
		{ literal: '224.0.0.1', family: 4, address: '224.0.0.1' },
		{ literal: '255.255.255.255', family: 4, address: '255.255.255.255' },
	];

	for (const { literal, family, address } of blockedLiterals) {
		test(`should block the address literal ${literal}`, async ({ assert }) => {
			const validator = new UrlValidatorService(async () => [
				{ address, family },
			]);

			assert.isFalse(await validator.isUrlAllowed(`http://${literal}/`));
		});
	}

	test('should allow a public IPv4 literal', async ({ assert }) => {
		const validator = validatorResolvingTo({
			'93.184.216.34': [{ address: '93.184.216.34', family: 4 }],
		});

		assert.isTrue(await validator.isUrlAllowed('http://93.184.216.34/'));
	});

	test('should allow a public IPv6 literal', async ({ assert }) => {
		const validator = validatorResolvingTo({
			'2606:2800:220:1:248:1893:25c8:1946': [
				{ address: '2606:2800:220:1:248:1893:25c8:1946', family: 6 },
			],
		});

		assert.isTrue(
			await validator.isUrlAllowed(
				'http://[2606:2800:220:1:248:1893:25c8:1946]/'
			)
		);
	});

	test('should allow an IPv4-mapped public address', async ({ assert }) => {
		const validator = validatorResolvingTo({
			'::ffff:5db8:d822': [{ address: '::ffff:5db8:d822', family: 6 }],
		});

		assert.isTrue(await validator.isUrlAllowed('http://[::ffff:5db8:d822]/'));
	});
});
