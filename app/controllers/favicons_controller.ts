import FaviconNotFoundException from '#exceptions/favicon_not_found_exception';
import type { HttpContext } from '@adonisjs/core/http';
import logger from '@adonisjs/core/services/logger';
import { parse } from 'node-html-parser';
import { cache } from '../lib/cache.js';

interface Favicon {
  buffer: Buffer;
  url: string;
  type: string;
  size: number;
}

// TODO: refactor this controller (adapted from the previous version of MyLinks)
export default class FaviconsController {
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

  async index(ctx: HttpContext) {
    const url = ctx.request.qs()?.url;
    if (!url) {
      throw new Error('Missing URL');
    }

    const cacheNs = cache.namespace('favicon');
    const favicon = await cacheNs.getOrSet({
      key: url,
      ttl: '1h',
      factory: () => this.tryGetFavicon(url),
    });
    return this.sendImage(ctx, favicon);
  }

  private async tryGetFavicon(url: string): Promise<Favicon> {
    const faviconUrl = this.buildFaviconUrl(url, '/favicon.ico');
    try {
      return await this.fetchFavicon(faviconUrl);
    } catch {
      logger.debug(`Unable to retrieve favicon from ${faviconUrl}`);
    }

    const documentText = await this.fetchDocumentText(url);
    const faviconPath = this.extractFaviconPath(documentText);

    if (!faviconPath) {
      throw new FaviconNotFoundException(`No favicon path found in ${url}`);
    }

    return this.fetchFaviconFromPath(url, faviconPath);
  }

  private async fetchFavicon(url: string): Promise<Favicon> {
    const response = await this.fetchWithUserAgent(url);
    if (!response.ok) {
      throw new FaviconNotFoundException(`Request to ${url} failed`);
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
    return `${baseUrl}/${path}`;
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

  private sendImage(ctx: HttpContext, { buffer, type, size }: Favicon) {
    ctx.response.header('Content-Type', type);
    ctx.response.header('Content-Length', size.toString());
    ctx.response.send(buffer, true);
  }
}
