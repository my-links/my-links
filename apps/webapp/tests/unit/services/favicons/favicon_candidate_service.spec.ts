import { test } from '@japa/runner';

import type { FaviconHttpResponse } from '#types/favicon_http_response';
import { EgressGuardProxy } from '#services/favicons/egress_guard_proxy';
import { FaviconHttpClient } from '#services/favicons/favicon_http_client';
import { UrlValidatorService } from '#services/favicons/url_validator_service';
import { FaviconCandidateService } from '#services/favicons/favicon_candidate_service';
import {
	ImpersonatedFetcher,
	type ImpersonatedFetchInit,
} from '#services/favicons/impersonated_fetcher';

const PAGE_URL = 'https://example.com/';
const MANIFEST_URL = 'https://example.com/site.webmanifest';
const MANIFEST_ICON_URL = 'https://example.com/manifest-icon.png';
const PAGE_HTML =
	'<html><head><link rel="manifest" href="/site.webmanifest"></head><body></body></html>';
const OVERSIZED_PADDING_BYTES = 128 * 1024;

class UnusedImpersonatedFetcher extends ImpersonatedFetcher {
	async fetch(
		_url: string,
		_init: ImpersonatedFetchInit
	): Promise<FaviconHttpResponse> {
		throw new Error('Impersonated fetch is not scripted');
	}
}

class ScriptedHttpClient extends FaviconHttpClient {
	constructor(private readonly responsesByUrl: Record<string, string>) {
		super(
			new UrlValidatorService(),
			new UnusedImpersonatedFetcher(),
			new EgressGuardProxy()
		);
	}

	async fetchWithUserAgent(url: string): Promise<FaviconHttpResponse> {
		return new Response(this.responsesByUrl[url] ?? '', {
			status: url in this.responsesByUrl ? 200 : 404,
		});
	}
}

function candidateUrlsFor(manifestBody: string): Promise<string[]> {
	const service = new FaviconCandidateService(
		new ScriptedHttpClient({
			[PAGE_URL]: PAGE_HTML,
			[MANIFEST_URL]: manifestBody,
		})
	);

	return service
		.resolveCandidates(PAGE_URL)
		.then(({ candidates }) => candidates.map((candidate) => candidate.url));
}

test.group('FaviconCandidateService: web app manifest', () => {
	test('should read the icons of a small manifest', async ({ assert }) => {
		const manifest = JSON.stringify({
			icons: [{ src: '/manifest-icon.png', sizes: '192x192' }],
		});

		assert.include(await candidateUrlsFor(manifest), MANIFEST_ICON_URL);
	});

	test('should ignore a manifest larger than the cap', async ({ assert }) => {
		const manifest = JSON.stringify({
			icons: [{ src: '/manifest-icon.png', sizes: '192x192' }],
			padding: 'x'.repeat(OVERSIZED_PADDING_BYTES),
		});

		assert.notInclude(await candidateUrlsFor(manifest), MANIFEST_ICON_URL);
	});

	test('should ignore a manifest that is not valid JSON', async ({
		assert,
	}) => {
		assert.notInclude(await candidateUrlsFor('{ not json'), MANIFEST_ICON_URL);
	});
});
