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
