import { inject } from '@adonisjs/core';
import logger from '@adonisjs/core/services/logger';

import type { Favicon } from '#types/favicon_type';
import { decodeDataUri } from '#lib/favicons/data_uri';
import { sniffImageType } from '#lib/favicons/image_sniffer';
import { FaviconHttpClient } from '#services/favicons/favicon_http_client';
import { UrlValidatorService } from '#services/favicons/url_validator_service';
import { UrlBlockedException } from '#exceptions/favicons/url_blocked_exception';
import type { FaviconCandidate } from '#lib/favicons/favicon_candidate_resolver';
import { FaviconImageProcessor } from '#services/favicons/favicon_image_processor';
import { FaviconCandidateService } from '#services/favicons/favicon_candidate_service';
import { FaviconNotFoundException } from '#exceptions/favicons/favicon_not_found_exception';

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

		if (!(await this.urlValidator.isUrlAllowed(normalizedUrl))) {
			throw new UrlBlockedException(`URL is blocked: ${normalizedUrl}`);
		}

		for (const candidate of await this.faviconCandidateService.resolveCandidates(
			normalizedUrl
		)) {
			try {
				return await this.fetchCandidate(candidate);
			} catch (error) {
				logger.debug(`Favicon candidate failed: ${candidate.url}`, error);
			}
		}

		throw new FaviconNotFoundException(
			`Unable to retrieve favicon from ${normalizedUrl}`
		);
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
				response.body,
				url
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
			logger.debug(`Favicon revalidation request failed for ${url}`, error);
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
			throw new FaviconNotFoundException('Invalid inline favicon data');
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
			throw new FaviconNotFoundException(`Request to favicon ${url} failed`);
		}

		const buffer = await this.faviconHttpClient.readImageBodyCapped(
			response.body,
			url
		);
		const sniffedType = sniffImageType(buffer);
		if (!sniffedType || buffer.length === 0) {
			throw new FaviconNotFoundException(`Invalid image at ${url}`);
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

	private normalizeUrl(url: string): string {
		try {
			const parsed = new URL(url);
			parsed.search = '';
			parsed.hash = '';
			return parsed.toString().replace(/\/$/, '');
		} catch {
			return url;
		}
	}
}
