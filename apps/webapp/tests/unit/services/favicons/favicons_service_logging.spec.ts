import { test } from '@japa/runner';

import { EgressGuardProxy } from '#services/favicons/egress_guard_proxy';
import { FaviconCandidateService } from '#services/favicons/favicon_candidate_service';
import { FaviconHttpClient } from '#services/favicons/favicon_http_client';
import { FaviconImageProcessor } from '#services/favicons/favicon_image_processor';
import { FaviconService } from '#services/favicons/favicons_service';
import { ImpitFetcher } from '#services/favicons/impit_fetcher';
import { UrlValidatorService } from '#services/favicons/url_validator_service';
import {
	clearCapturedLogs,
	readAlwaysOnLogs,
} from '#tests/helpers/captured_logs';

const PRIVATE_HOSTNAME = 'secret-intranet.example.org';
const PRIVATE_URL = `https://${PRIVATE_HOSTNAME}/private/page`;

class CandidatelessCandidateService extends FaviconCandidateService {
	override resolveCandidates() {
		return Promise.resolve({ candidates: [], documentFailure: 'timeout' });
	}
}

function buildFaviconService() {
	const validator = new UrlValidatorService(async () => [
		{ address: '93.184.216.34', family: 4 },
	]);
	const egressGuard = new EgressGuardProxy();
	const faviconHttpClient = new FaviconHttpClient(
		validator,
		new ImpitFetcher(egressGuard),
		egressGuard
	);

	return new FaviconService(
		validator,
		faviconHttpClient,
		new FaviconImageProcessor(),
		new CandidatelessCandidateService(faviconHttpClient)
	);
}

test.group('FaviconService: logging', (group) => {
	group.each.setup(() => clearCapturedLogs());

	test('should keep the hostname out of info and warn logs when no favicon can be resolved', async ({
		assert,
	}) => {
		await buildFaviconService()
			.getFavicon(PRIVATE_URL)
			.catch(() => undefined);

		assert.notInclude(JSON.stringify(readAlwaysOnLogs()), PRIVATE_HOSTNAME);
	});

	test('should log a warning when no favicon can be resolved', async ({
		assert,
	}) => {
		await buildFaviconService()
			.getFavicon(PRIVATE_URL)
			.catch(() => undefined);

		assert.isTrue(
			readAlwaysOnLogs().some(
				(line) => line.msg === 'Favicon resolution failed'
			)
		);
	});
});
