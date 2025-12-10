import FaviconNotFoundException from '#exceptions/favicons/favicon_not_found_exception';
import { Favicon } from '#types/favicons/favicon_type';
import logger from '@adonisjs/core/services/logger';
import { parse } from 'node-html-parser';

export class FaviconService {
	private userAgent =
		'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36 Edg/119.0.0.0';
	private relList = [
		'icon',
		'shortcut icon',
		'apple-touch-icon',
		'apple-touch-icon-precomposed',
		'apple-touch-startup-image',
		'mask-icon',
		'fluid-icon',
	];

	async getFavicon(url: string): Promise<Favicon> {
		try {
			return await this.fetchFavicon(this.buildFaviconUrl(url, '/favicon.ico'));
		} catch {
			logger.debug(`Unable to retrieve favicon from ${url}/favicon.ico`);
		}

		const documentText = await this.fetchDocumentText(url);
		const faviconPath = this.extractFaviconPath(documentText);

		if (!faviconPath) {
			throw new FaviconNotFoundException(`No favicon path found in ${url}`);
		}

		return await this.fetchFaviconFromPath(url, faviconPath);
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
		const link = document
			.getElementsByTagName('link')
			.find((element) => this.relList.includes(element.getAttribute('rel')!));
		return link?.getAttribute('href');
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
		const headers = new Headers({ 'User-Agent': this.userAgent });
		return fetch(url, { headers });
	}
}
