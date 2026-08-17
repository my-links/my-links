import logger from '@adonisjs/core/services/logger';

import type { Favicon } from '#types/favicon_type';
import { sniffImageType } from '#services/favicons/image_sniffer';
import UrlBlockedException from '#exceptions/favicons/url_blocked_exception';
import { UrlValidatorService } from '#services/favicons/url_validator_service';
import FaviconNotFoundException from '#exceptions/favicons/favicon_not_found_exception';
import { webAppManifestValidator } from '#validators/favicons/web_app_manifest_validator';
import {
	parseDocument,
	resolveUrl,
	findManifestHref,
	resolveDocumentBaseUrl,
	extractLinkIconCandidates,
	extractMetaImageCandidates,
	extractManifestIconCandidates,
	type FaviconCandidate,
} from '#services/favicons/favicon_candidate_resolver';

const MAX_HTML_BYTES = 256 * 1024;
const FAVICON_ICO_PATH = '/favicon.ico';
const FAVICON_ICO_SCORE = 0;

export class FaviconService {
	private readonly userAgent =
		'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36 Edg/119.0.0.0';
	private readonly requestTimeout = 10000;
	private readonly maxRedirects = 5;
	private readonly urlValidator: UrlValidatorService;

	constructor() {
		this.urlValidator = new UrlValidatorService();
	}

	async getFavicon(url: string): Promise<Favicon> {
		const normalizedUrl = this.normalizeUrl(url);

		if (!(await this.urlValidator.isUrlAllowed(normalizedUrl))) {
			throw new UrlBlockedException(`URL is blocked: ${normalizedUrl}`);
		}

		for (const candidate of await this.resolveCandidates(normalizedUrl)) {
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

	// Declared icons are tried before the /favicon.ico fallback, in tiers from
	// most to least authoritative: <link rel=icon>, manifest.json icons,
	// msapplication-TileImage / og:image, then the root /favicon.ico.
	private async resolveCandidates(
		normalizedUrl: string
	): Promise<FaviconCandidate[]> {
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

			const response = await this.fetchOnce(manifestUrl);
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

	private async fetchDocument(
		url: string
	): Promise<{ html: string; finalUrl: string } | undefined> {
		try {
			const response = await this.fetchWithUserAgent(url);
			if (!response.ok || !response.body) {
				return undefined;
			}

			return {
				html: await this.readBodyCapped(response.body),
				finalUrl: response.url || url,
			};
		} catch (error) {
			logger.debug(`Failed to fetch document from ${url}`, error);
			return undefined;
		}
	}

	// Cloudflare's default error page is ~1.3 MB; buffering the whole thing
	// before parsing blocks the event loop for nothing since the icon
	// declarations live in <head>. Stop as soon as we've seen it or hit the cap.
	private async readBodyCapped(
		body: ReadableStream<Uint8Array>
	): Promise<string> {
		const reader = body.getReader();
		const chunks: Uint8Array[] = [];
		let totalBytes = 0;

		try {
			while (totalBytes < MAX_HTML_BYTES) {
				const { done, value } = await reader.read();
				if (done || !value) {
					break;
				}

				chunks.push(value);
				totalBytes += value.length;

				if (Buffer.concat(chunks).includes('</head>')) {
					break;
				}
			}
		} finally {
			await reader.cancel().catch(() => {});
		}

		return Buffer.concat(chunks).toString('utf8');
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

	private decodeDataImage(dataUri: string): Favicon {
		const buffer = this.convertBase64ToBuffer(dataUri);
		const type = sniffImageType(buffer);
		if (!type) {
			throw new FaviconNotFoundException('Invalid inline favicon data');
		}

		return { buffer, type, size: buffer.length, url: dataUri };
	}

	private convertBase64ToBuffer(dataUri: string): Buffer {
		return Buffer.from(dataUri.split(',')[1] ?? '', 'base64');
	}

	private async fetchFavicon(url: string): Promise<Favicon> {
		const response = await this.fetchWithUserAgent(url);
		if (!response.ok) {
			throw new FaviconNotFoundException(`Request to favicon ${url} failed`);
		}

		const buffer = Buffer.from(await response.arrayBuffer());
		const type = sniffImageType(buffer);
		if (!type || buffer.length === 0) {
			throw new FaviconNotFoundException(`Invalid image at ${url}`);
		}

		return { buffer, url: response.url, type, size: buffer.length };
	}

	private async fetchWithUserAgent(url: string): Promise<Response> {
		let targetUrl = url;

		for (let hop = 0; hop <= this.maxRedirects; hop += 1) {
			if (!(await this.urlValidator.isUrlAllowed(targetUrl))) {
				throw new UrlBlockedException(`URL is blocked: ${targetUrl}`);
			}

			const response = await this.fetchOnce(targetUrl);

			if (!this.isRedirect(response.status)) {
				return response;
			}

			const location = response.headers.get('location');
			if (!location) {
				return response;
			}

			targetUrl = new URL(location, targetUrl).toString();
		}

		throw new FaviconNotFoundException(`Too many redirects for ${url}`);
	}

	private isRedirect(status: number): boolean {
		return status >= 300 && status < 400;
	}

	private async fetchOnce(url: string): Promise<Response> {
		const controller = new AbortController();
		const timeoutId = setTimeout(() => controller.abort(), this.requestTimeout);

		try {
			const headers = new Headers({ 'User-Agent': this.userAgent });
			const response = await fetch(url, {
				headers,
				signal: controller.signal,
				redirect: 'manual',
			});
			clearTimeout(timeoutId);
			return response;
		} catch (error) {
			clearTimeout(timeoutId);
			if (error instanceof Error && error.name === 'AbortError') {
				throw new FaviconNotFoundException(`Request timeout for ${url}`);
			}
			throw error;
		}
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
