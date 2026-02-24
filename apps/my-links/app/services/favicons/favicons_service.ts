import FaviconNotFoundException from '#exceptions/favicons/favicon_not_found_exception';
import UrlBlockedException from '#exceptions/favicons/url_blocked_exception';
import { UrlValidatorService } from '#services/favicons/url_validator_service';
import { Favicon } from '#types/favicons/favicon_type';
import logger from '@adonisjs/core/services/logger';
import { parse } from 'node-html-parser';

export class FaviconService {
	private readonly userAgent =
		'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36 Edg/119.0.0.0';
	private readonly relList = [
		'icon',
		'shortcut icon',
		'apple-touch-icon',
		'apple-touch-icon-precomposed',
		'apple-touch-startup-image',
		'mask-icon',
		'fluid-icon',
	];
	private readonly requestTimeout = 10000;
	private readonly urlValidator: UrlValidatorService;

	constructor() {
		this.urlValidator = new UrlValidatorService();
	}

	async getFavicon(url: string): Promise<Favicon> {
		const normalizedUrl = this.normalizeUrl(url);

		if (!this.urlValidator.isUrlAllowed(normalizedUrl)) {
			throw new UrlBlockedException(`URL is blocked: ${normalizedUrl}`);
		}

		try {
			return await this.fetchFavicon(
				this.buildFaviconUrl(normalizedUrl, '/favicon.ico')
			);
		} catch (error) {
			logger.debug(
				`Unable to retrieve favicon from ${normalizedUrl}/favicon.ico`,
				error
			);
		}

		try {
			const documentText = await this.fetchDocumentText(normalizedUrl);
			const faviconPath = this.extractFaviconPath(documentText);

			if (!faviconPath) {
				throw new FaviconNotFoundException(
					`No favicon path found in ${normalizedUrl}`
				);
			}

			return await this.fetchFaviconFromPath(normalizedUrl, faviconPath);
		} catch (error) {
			if (error instanceof FaviconNotFoundException) {
				throw error;
			}
			logger.debug(`Failed to fetch document from ${normalizedUrl}`, error);
			throw new FaviconNotFoundException(
				`Unable to retrieve favicon from ${normalizedUrl}`
			);
		}
	}

	private async fetchFavicon(url: string): Promise<Favicon> {
		const response = await this.fetchWithUserAgent(url);
		if (!response.ok) {
			throw new FaviconNotFoundException(`Request to favicon ${url} failed`);
		}

		const blob = await response.blob();
		if (!this.isImage(blob.type) || blob.size === 0) {
			throw new FaviconNotFoundException(`Invalid image at ${url}`);
		}

		return {
			buffer: Buffer.from(await blob.arrayBuffer()),
			url: response.url,
			type: blob.type,
			size: blob.size,
		};
	}

	private async fetchDocumentText(url: string): Promise<string> {
		const response = await this.fetchWithUserAgent(url);
		if (!response.ok) {
			throw new FaviconNotFoundException(`Request to ${url} failed`);
		}

		return await response.text();
	}

	private extractFaviconPath(html: string): string | undefined {
		const document = parse(html);
		const links = document.getElementsByTagName('link');

		for (const link of links) {
			const rel = link.getAttribute('rel')?.toLowerCase();
			if (rel && this.relList.includes(rel)) {
				const href = link.getAttribute('href');
				if (href) {
					return href;
				}
			}
		}

		return undefined;
	}

	private async fetchFaviconFromPath(
		baseUrl: string,
		path: string
	): Promise<Favicon> {
		if (this.isBase64Image(path)) {
			const buffer = this.convertBase64ToBuffer(path);
			return {
				buffer,
				type: 'image/x-icon',
				size: buffer.length,
				url: path,
			};
		}

		const faviconUrl = this.buildFaviconUrl(baseUrl, path);
		return this.fetchFavicon(faviconUrl);
	}

	private buildFaviconUrl(base: string, path: string): string {
		const { origin } = new URL(base);
		if (path.startsWith('/')) {
			return origin + path;
		}

		const basePath = this.urlWithoutSearchParams(base);
		const baseUrl = basePath.endsWith('/') ? basePath.slice(0, -1) : basePath;
		const finalUrl = `${baseUrl}/${path}`;
		logger.debug(`Built favicon URL: ${finalUrl}`);
		return finalUrl;
	}

	private urlWithoutSearchParams(url: string): string {
		const { protocol, host, pathname } = new URL(url);
		return `${protocol}//${host}${pathname}`;
	}

	private isImage(type: string): boolean {
		return type.startsWith('image/');
	}

	private isBase64Image(data: string): boolean {
		return data.startsWith('data:image/');
	}

	private convertBase64ToBuffer(base64: string): Buffer {
		return Buffer.from(base64.split(',')[1], 'base64');
	}

	private async fetchWithUserAgent(url: string): Promise<Response> {
		const controller = new AbortController();
		const timeoutId = setTimeout(() => controller.abort(), this.requestTimeout);

		try {
			const headers = new Headers({ 'User-Agent': this.userAgent });
			const response = await fetch(url, {
				headers,
				signal: controller.signal,
				redirect: 'follow',
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
