import { inject } from '@adonisjs/core';
import logger from '@adonisjs/core/services/logger';

import { FaviconNotFoundException } from '#exceptions/favicons/favicon_not_found_exception';
import { decodeDataUri } from '#lib/favicons/data_uri';
import {
	labelCandidate,
	describeFailure,
	summarizeAttempts,
} from '#lib/favicons/failure_summary';
import type { FaviconCandidate } from '#lib/favicons/favicon_candidate_resolver';
import { sniffImageType } from '#lib/favicons/image_sniffer';
import { toLoggableOrigin } from '#lib/logging/loggable_origin';
import { FaviconCandidateService } from '#services/favicons/favicon_candidate_service';
import { FaviconHttpClient } from '#services/favicons/favicon_http_client';
import { FaviconImageProcessor } from '#services/favicons/favicon_image_processor';
import { UrlValidatorService } from '#services/favicons/url_validator_service';
import type { Favicon } from '#types/favicon_type';

const OPAQUE_ORIGIN = 'null';

@inject()
export class FaviconService {
	constructor(
		private readonly urlValidator: UrlValidatorService,
		private readonly faviconHttpClient: FaviconHttpClient,
		private readonly faviconImageProcessor: FaviconImageProcessor,
		private readonly faviconCandidateService: FaviconCandidateService
	) {}

	async getFavicon(url: string): Promise<Favicon> {
		const normalizedUrl = this.normalizeUrl(url);

		await this.urlValidator.assertUrlAllowed(normalizedUrl);

		const { candidates, documentFailure } =
			await this.faviconCandidateService.resolveCandidates(normalizedUrl);
		const attempts = documentFailure ? [`document: ${documentFailure}`] : [];

		for (const candidate of candidates) {
			try {
				return await this.fetchCandidate(candidate);
			} catch (error) {
				logger.debug(
					{ err: error, origin: toLoggableOrigin(candidate.url) },
					'Favicon candidate failed'
				);
				attempts.push(
					`${labelCandidate(candidate.url)}: ${describeFailure(error)}`
				);
			}
		}

		const summary = summarizeAttempts(attempts);
		logger.warn({ reason: summary }, 'Favicon resolution failed');
		throw new FaviconNotFoundException(summary);
	}

	async checkForUpdate(
		url: string,
		validators: { etag?: string | null; lastModified?: string | null }
	): Promise<{ changed: false } | { changed: true; favicon: Favicon }> {
		const conditionalHeaders: Record<string, string> = {};
		if (validators.etag) {
			conditionalHeaders['If-None-Match'] = validators.etag;
		}
		if (validators.lastModified) {
			conditionalHeaders['If-Modified-Since'] = validators.lastModified;
		}

		try {
			const response = await this.faviconHttpClient.fetchWithUserAgent(
				url,
				conditionalHeaders
			);
			if (response.status === 304 || !response.ok || !response.body) {
				return { changed: false };
			}

			const buffer = await this.faviconHttpClient.readImageBodyCapped(
				response.body
			);
			const sniffedType = sniffImageType(buffer);
			if (!sniffedType || buffer.length === 0) {
				return { changed: false };
			}
			const image = await this.faviconImageProcessor.downscale(
				buffer,
				sniffedType
			);

			return {
				changed: true,
				favicon: {
					buffer: image.buffer,
					type: image.type,
					size: image.buffer.length,
					url: response.url,
					etag: response.headers.get('etag'),
					lastModified: response.headers.get('last-modified'),
				},
			};
		} catch (error) {
			logger.debug(
				{ err: error, origin: toLoggableOrigin(url) },
				'Favicon revalidation request failed'
			);
			return { changed: false };
		}
	}

	private async fetchCandidate(candidate: FaviconCandidate): Promise<Favicon> {
		if (this.isDataImage(candidate.url)) {
			return this.decodeDataImage(candidate.url);
		}

		return this.fetchFavicon(candidate.url);
	}

	private isDataImage(url: string): boolean {
		return url.startsWith('data:image/');
	}

	private async decodeDataImage(dataUri: string): Promise<Favicon> {
		const buffer = decodeDataUri(dataUri);
		const sniffedType = buffer && sniffImageType(buffer);
		if (!buffer || !sniffedType) {
			throw new FaviconNotFoundException('invalid inline data');
		}

		const image = await this.faviconImageProcessor.downscale(
			buffer,
			sniffedType
		);
		return {
			buffer: image.buffer,
			type: image.type,
			size: image.buffer.length,
			url: dataUri,
		};
	}

	private async fetchFavicon(url: string): Promise<Favicon> {
		const response = await this.faviconHttpClient.fetchWithUserAgent(url);
		if (!response.ok || !response.body) {
			throw new FaviconNotFoundException(`HTTP ${response.status}`);
		}

		const buffer = await this.faviconHttpClient.readImageBodyCapped(
			response.body
		);
		const sniffedType = sniffImageType(buffer);
		if (!sniffedType || buffer.length === 0) {
			throw new FaviconNotFoundException('invalid image');
		}
		const image = await this.faviconImageProcessor.downscale(
			buffer,
			sniffedType
		);

		return {
			buffer: image.buffer,
			url: response.url,
			type: image.type,
			size: image.buffer.length,
			etag: response.headers.get('etag'),
			lastModified: response.headers.get('last-modified'),
		};
	}

	/**
	 * Entries are keyed by origin, so the document is fetched from the origin
	 * root: fetching the bookmarked path could trigger a single-use link.
	 */
	private normalizeUrl(url: string): string {
		try {
			const { origin } = new URL(url);
			return origin === OPAQUE_ORIGIN ? url : `${origin}/`;
		} catch {
			return url;
		}
	}
}
