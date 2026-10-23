import { test } from '@japa/runner';

import { EgressGuardProxy } from '#services/favicons/egress_guard_proxy';
import { FaviconCandidateService } from '#services/favicons/favicon_candidate_service';
import { FaviconHttpClient } from '#services/favicons/favicon_http_client';
import { FaviconImageProcessor } from '#services/favicons/favicon_image_processor';
import { FaviconService } from '#services/favicons/favicons_service';
import { ImpitFetcher } from '#services/favicons/impit_fetcher';
import { UrlValidatorService } from '#services/favicons/url_validator_service';
import type { FaviconHttpResponse } from '#types/favicon_http_response';

const HOME_URL = 'https://bookmarked.example.org/';
const BOOKMARKED_URL =
	'https://bookmarked.example.org/one-time/token-123/page?session=abc#section';
const HOME_HTML =
	'<html><head><link rel="icon" href="img/icon.png"></head></html>';
const NOT_FOUND_STATUS = 404;

function buildResponse(url: string, html: string | null): FaviconHttpResponse {
	const response = new Response(html, {
		status: html === null ? NOT_FOUND_STATUS : 200,
	});

	return {
		ok: response.ok,
		status: response.status,
		url,
		headers: response.headers,
		body: response.body,
		json: () => response.json(),
	};
}

class RecordingHttpClient extends FaviconHttpClient {
	readonly requestedUrls: string[] = [];

	override fetchWithUserAgent(url: string): Promise<FaviconHttpResponse> {
		this.requestedUrls.push(url);
		const html = url === HOME_URL ? HOME_HTML : null;

		return Promise.resolve(buildResponse(url, html));
	}
}

function buildRecordingService() {
	const validator = new UrlValidatorService(async () => [
		{ address: '93.184.216.34', family: 4 },
	]);
	const egressGuard = new EgressGuardProxy();
	const faviconHttpClient = new RecordingHttpClient(
		validator,
		new ImpitFetcher(egressGuard),
		egressGuard
	);
	const faviconService = new FaviconService(
		validator,
		faviconHttpClient,
		new FaviconImageProcessor(),
		new FaviconCandidateService(faviconHttpClient)
	);

	return { faviconService, faviconHttpClient };
}

test.group('FaviconService: origin root resolution', () => {
	test('should fetch the origin root document instead of the bookmarked path', async ({
		assert,
	}) => {
		const { faviconService, faviconHttpClient } = buildRecordingService();

		await faviconService.getFavicon(BOOKMARKED_URL).catch(() => undefined);

		assert.equal(faviconHttpClient.requestedUrls[0], HOME_URL);
	});

	test('should never request the bookmarked path or its query', async ({
		assert,
	}) => {
		const { faviconService, faviconHttpClient } = buildRecordingService();

		await faviconService.getFavicon(BOOKMARKED_URL).catch(() => undefined);

		assert.isFalse(
			faviconHttpClient.requestedUrls.some((url) => url.includes('one-time'))
		);
	});

	test('should resolve a relative icon href against the fetched document', async ({
		assert,
	}) => {
		const { faviconService, faviconHttpClient } = buildRecordingService();

		await faviconService.getFavicon(BOOKMARKED_URL).catch(() => undefined);

		assert.include(
			faviconHttpClient.requestedUrls,
			'https://bookmarked.example.org/img/icon.png'
		);
	});
});
