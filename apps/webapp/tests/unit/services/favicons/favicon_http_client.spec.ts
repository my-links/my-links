import { test } from '@japa/runner';

import type { FaviconHttpResponse } from '#types/favicon_http_response';
import { FaviconHttpClient } from '#services/favicons/favicon_http_client';
import { UrlValidatorService } from '#services/favicons/url_validator_service';
import { UrlBlockedException } from '#exceptions/favicons/url_blocked_exception';
import { FaviconNotFoundException } from '#exceptions/favicons/favicon_not_found_exception';
import { UnresolvableHostException } from '#exceptions/favicons/unresolvable_host_exception';
import {
	ImpersonatedFetcher,
	type ImpersonatedFetchInit,
} from '#services/favicons/impersonated_fetcher';

const PUBLIC_ADDRESS = [{ address: '93.184.216.34', family: 4 }];
const PRIVATE_ADDRESS = [{ address: '10.0.0.1', family: 4 }];
const TARGET_URL = 'https://example.com/favicon.ico';

type ScriptedOutcome = FaviconHttpResponse | Error;

class FakeImpersonatedFetcher extends ImpersonatedFetcher {
	readonly requestedUrls: string[] = [];

	constructor(private readonly outcomes: ScriptedOutcome[]) {
		super();
	}

	async fetch(
		url: string,
		_init: ImpersonatedFetchInit
	): Promise<FaviconHttpResponse> {
		this.requestedUrls.push(url);
		const outcome = this.outcomes.shift();
		if (!outcome) {
			throw new Error('No scripted outcome left');
		}
		if (outcome instanceof Error) {
			throw outcome;
		}
		return outcome;
	}
}

function buildClient(fetcher: ImpersonatedFetcher) {
	const records: Record<string, { address: string; family: number }[]> = {
		'example.com': PUBLIC_ADDRESS,
		'internal.example.org': PRIVATE_ADDRESS,
	};
	const validator = new UrlValidatorService(async (hostname) => {
		const addresses = records[hostname];
		if (!addresses) {
			throw new Error(`ENOTFOUND ${hostname}`);
		}
		return addresses;
	});
	return new FaviconHttpClient(validator, fetcher);
}

test.group('FaviconHttpClient.fetchWithUserAgent', (group) => {
	const originalFetch = globalThis.fetch;
	let nodeFetchCalls = 0;

	group.each.setup(() => {
		nodeFetchCalls = 0;
		globalThis.fetch = async () => {
			nodeFetchCalls += 1;
			return new Response(null, {
				status: 200,
				headers: { 'x-source': 'node' },
			});
		};
	});

	group.each.teardown(() => {
		globalThis.fetch = originalFetch;
	});

	test('should return the impersonated response when it is not blocked', async ({
		assert,
	}) => {
		const client = buildClient(
			new FakeImpersonatedFetcher([
				new Response(null, { status: 200, headers: { 'x-source': 'impit' } }),
			])
		);

		const response = await client.fetchWithUserAgent(TARGET_URL);

		assert.equal(response.headers.get('x-source'), 'impit');
	});

	test('should not call Node fetch when the impersonated response is not blocked', async ({
		assert,
	}) => {
		const client = buildClient(
			new FakeImpersonatedFetcher([
				new Response(null, { status: 200, headers: { 'x-source': 'impit' } }),
			])
		);

		await client.fetchWithUserAgent(TARGET_URL);

		assert.equal(nodeFetchCalls, 0);
	});

	test('should fall back to the Node cascade when the impersonated response is blocked', async ({
		assert,
	}) => {
		const client = buildClient(
			new FakeImpersonatedFetcher([new Response('no', { status: 403 })])
		);

		const response = await client.fetchWithUserAgent(TARGET_URL);

		assert.equal(response.headers.get('x-source'), 'node');
	});

	test('should fall back to the Node cascade when the impersonated fetch throws a transport error', async ({
		assert,
	}) => {
		const client = buildClient(
			new FakeImpersonatedFetcher([new Error('ConnectError: tls failure')])
		);

		const response = await client.fetchWithUserAgent(TARGET_URL);

		assert.equal(response.headers.get('x-source'), 'node');
	});

	test('should reject with UrlBlockedException when an impersonated redirect targets a private address', async ({
		assert,
	}) => {
		const redirect = new Response(null, {
			status: 301,
			headers: { location: 'https://internal.example.org/icon.ico' },
		});
		const client = buildClient(new FakeImpersonatedFetcher([redirect]));

		const error = await client
			.fetchWithUserAgent(TARGET_URL)
			.catch((caught: unknown) => caught);

		assert.instanceOf(error, UrlBlockedException);
	});

	test('should not call Node fetch when an impersonated redirect is blocked', async ({
		assert,
	}) => {
		const redirect = new Response(null, {
			status: 301,
			headers: { location: 'https://internal.example.org/icon.ico' },
		});
		const client = buildClient(new FakeImpersonatedFetcher([redirect]));

		await client.fetchWithUserAgent(TARGET_URL).catch(() => {});

		assert.equal(nodeFetchCalls, 0);
	});

	test('should reject with a timeout FaviconNotFoundException when the impersonated fetch times out', async ({
		assert,
	}) => {
		const client = buildClient(
			new FakeImpersonatedFetcher([new DOMException('t', 'TimeoutError')])
		);

		const error = await client
			.fetchWithUserAgent(TARGET_URL)
			.catch((caught: unknown) => caught);

		assert.instanceOf(error, FaviconNotFoundException);
		assert.equal((error as Error).message, 'timeout');
	});

	test('should not call Node fetch when the impersonated fetch times out', async ({
		assert,
	}) => {
		const client = buildClient(
			new FakeImpersonatedFetcher([new DOMException('t', 'TimeoutError')])
		);

		await client.fetchWithUserAgent(TARGET_URL).catch(() => {});

		assert.equal(nodeFetchCalls, 0);
	});

	test('should reject with UnresolvableHostException when the host does not resolve', async ({
		assert,
	}) => {
		const client = buildClient(new FakeImpersonatedFetcher([]));

		const error = await client
			.fetchWithUserAgent('https://unknown.example.net/favicon.ico')
			.catch((caught: unknown) => caught);

		assert.instanceOf(error, UnresolvableHostException);
	});
});
