import { inject } from '@adonisjs/core';
import logger from '@adonisjs/core/services/logger';

import { describeFailure } from '#lib/favicons/failure_summary';
import { FaviconHttpClient } from '#services/favicons/favicon_http_client';
import { webAppManifestValidator } from '#validators/favicons/web_app_manifest_validator';
import {
	parseDocument,
	resolveUrl,
	findManifestHref,
	findMetaRefreshUrl,
	resolveDocumentBaseUrl,
	extractLinkIconCandidates,
	extractMetaImageCandidates,
	extractManifestIconCandidates,
	type FaviconCandidate,
} from '#lib/favicons/favicon_candidate_resolver';

const FAVICON_ICO_PATH = '/favicon.ico';
const FAVICON_ICO_SCORE = 0;
const MAX_META_REFRESH_HOPS = 3;

type FetchedDocument = { html: string; finalUrl: string };
type DocumentFetchOutcome = { document: FetchedDocument } | { failure: string };

export type CandidateResolution = {
	candidates: FaviconCandidate[];
	documentFailure?: string;
};

@inject()
export class FaviconCandidateService {
	constructor(private readonly faviconHttpClient: FaviconHttpClient) {}

	// Tiers from most to least authoritative: link icons, manifest icons, tile/og images, then /favicon.ico.
	async resolveCandidates(normalizedUrl: string): Promise<CandidateResolution> {
		const outcome = await this.fetchDocument(normalizedUrl);
		const document = 'document' in outcome ? outcome.document : undefined;
		const candidates: FaviconCandidate[] = [];

		if (document) {
			const parsed = parseDocument(document.html);
			const baseUrl = resolveDocumentBaseUrl(parsed, document.finalUrl);

			candidates.push(...extractLinkIconCandidates(parsed, baseUrl));
			candidates.push(
				...(await this.resolveManifestCandidates(parsed, baseUrl))
			);
			candidates.push(...extractMetaImageCandidates(parsed, baseUrl));
		}

		const faviconIcoUrl = resolveUrl(
			FAVICON_ICO_PATH,
			document?.finalUrl ?? normalizedUrl
		);
		if (faviconIcoUrl) {
			candidates.push({ url: faviconIcoUrl, score: FAVICON_ICO_SCORE });
		}

		return {
			candidates,
			documentFailure: 'failure' in outcome ? outcome.failure : undefined,
		};
	}

	private async resolveManifestCandidates(
		document: ReturnType<typeof parseDocument>,
		baseUrl: string
	): Promise<FaviconCandidate[]> {
		const manifestHref = findManifestHref(document);
		if (!manifestHref) {
			return [];
		}

		const manifestUrl = resolveUrl(manifestHref, baseUrl);
		if (!manifestUrl) {
			return [];
		}

		const manifest = await this.fetchWebAppManifest(manifestUrl);
		return manifest ? extractManifestIconCandidates(manifest, manifestUrl) : [];
	}

	private async fetchWebAppManifest(manifestUrl: string) {
		try {
			const response =
				await this.faviconHttpClient.fetchWithUserAgent(manifestUrl);
			if (!response.ok) {
				return undefined;
			}

			const json: unknown = await response.json();
			return await webAppManifestValidator.validate(json);
		} catch (error) {
			logger.debug(
				`Failed to fetch or parse web app manifest ${manifestUrl}`,
				error
			);
			return undefined;
		}
	}

	// A meta refresh landing page never declares its own icon: the real one lives on the page it lands on.
	private async fetchDocument(url: string): Promise<DocumentFetchOutcome> {
		let targetUrl = url;

		for (let hop = 0; hop <= MAX_META_REFRESH_HOPS; hop += 1) {
			const outcome = await this.fetchDocumentOnce(targetUrl);
			if ('failure' in outcome) {
				return outcome;
			}

			const { document } = outcome;
			const refreshUrl = findMetaRefreshUrl(parseDocument(document.html));
			const resolvedRefreshUrl =
				refreshUrl && resolveUrl(refreshUrl, document.finalUrl);
			if (!resolvedRefreshUrl || resolvedRefreshUrl === document.finalUrl) {
				return outcome;
			}

			targetUrl = resolvedRefreshUrl;
		}

		return { failure: 'too many meta refreshes' };
	}

	private async fetchDocumentOnce(url: string): Promise<DocumentFetchOutcome> {
		try {
			const response = await this.faviconHttpClient.fetchWithUserAgent(url);
			if (!response.ok) {
				return { failure: String(response.status) };
			}
			if (!response.body) {
				return { failure: 'empty body' };
			}

			return {
				document: {
					html: await this.faviconHttpClient.readBodyCapped(response.body),
					finalUrl: response.url || url,
				},
			};
		} catch (error) {
			logger.debug(`Failed to fetch document from ${url}`, error);
			return { failure: describeFailure(error) };
		}
	}
}
