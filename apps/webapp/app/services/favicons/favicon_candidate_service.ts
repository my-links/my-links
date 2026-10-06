import { inject } from '@adonisjs/core';
import logger from '@adonisjs/core/services/logger';

import { FaviconHttpClient } from '#services/favicons/favicon_http_client';
import { UrlValidatorService } from '#services/favicons/url_validator_service';
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

@inject()
export class FaviconCandidateService {
	constructor(
		private readonly urlValidator: UrlValidatorService,
		private readonly faviconHttpClient: FaviconHttpClient
	) {}

	// Tiers from most to least authoritative: link icons, manifest icons, tile/og images, then /favicon.ico.
	async resolveCandidates(normalizedUrl: string): Promise<FaviconCandidate[]> {
		const document = await this.fetchDocument(normalizedUrl);
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

		return candidates;
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
			if (!(await this.urlValidator.isUrlAllowed(manifestUrl))) {
				return undefined;
			}

			const response = await this.faviconHttpClient.fetchOnce(manifestUrl);
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
	private async fetchDocument(
		url: string
	): Promise<{ html: string; finalUrl: string } | undefined> {
		let targetUrl = url;

		for (let hop = 0; hop <= MAX_META_REFRESH_HOPS; hop += 1) {
			const document = await this.fetchDocumentOnce(targetUrl);
			if (!document) {
				return undefined;
			}

			const refreshUrl = findMetaRefreshUrl(parseDocument(document.html));
			const resolvedRefreshUrl =
				refreshUrl && resolveUrl(refreshUrl, document.finalUrl);
			if (!resolvedRefreshUrl || resolvedRefreshUrl === document.finalUrl) {
				return document;
			}

			targetUrl = resolvedRefreshUrl;
		}

		return undefined;
	}

	private async fetchDocumentOnce(
		url: string
	): Promise<{ html: string; finalUrl: string } | undefined> {
		try {
			const response = await this.faviconHttpClient.fetchWithUserAgent(url);
			if (!response.ok || !response.body) {
				return undefined;
			}

			return {
				html: await this.faviconHttpClient.readBodyCapped(response.body),
				finalUrl: response.url || url,
			};
		} catch (error) {
			logger.debug(`Failed to fetch document from ${url}`, error);
			return undefined;
		}
	}
}
