import type { HttpContext } from '@adonisjs/core/http';
import logger from '@adonisjs/core/services/logger';
import { parse } from 'node-html-parser';
import { createReadStream } from 'node:fs';
import { resolve } from 'node:path';

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
    console.log('0');
    const url = ctx.request.qs()?.url;
    if (!url) {
      throw new Error('Missing URL');
    }

    console.log('1');
    const faviconRequestUrl = this.buildFaviconUrl(url, '/favicon.ico');
    try {
      const favicon = await this.getFavicon(faviconRequestUrl);
      return this.sendImage(ctx, favicon);
    } catch (error) {
      logger.info(
        `[Favicon] [first: ${faviconRequestUrl}] Unable to retrieve favicon from favicon.ico url`
      );
    }
    console.log('2');

    const requestDocument = await this.makeRequestWithUserAgent(url);
    const documentAsText = await requestDocument.text();

    const faviconPath = this.findFaviconPath(documentAsText);
    if (!faviconPath) {
      console.error(
        '[Favicon]',
        `[first: ${faviconRequestUrl}]`,
        'No link/href attribute found'
      );
      return this.sendDefaultImage(ctx);
    }

    console.log('3');
    const finalUrl = this.buildFaviconUrl(requestDocument.url, faviconPath);
    try {
      if (!faviconPath) {
        throw new Error('Unable to find favicon path');
      }

      if (this.isBase64Image(faviconPath)) {
        console.log(
          '[Favicon]',
          `[second: ${faviconRequestUrl}]`,
          'info: base64, convert it to buffer'
        );
        const buffer = this.convertBase64ToBuffer(faviconPath);
        return this.sendImage(ctx, {
          buffer,
          type: 'image/x-icon',
          size: buffer.length,
          url: faviconPath,
        });
      }

      // eslint-disable-next-line @typescript-eslint/no-shadow
      const finalUrl = faviconPath.startsWith('http')
        ? faviconPath
        : this.buildFaviconUrl(requestDocument.url, faviconPath);
      const favicon = await this.downloadImageFromUrl(finalUrl);
      if (!this.isImage(favicon.type)) {
        throw new Error('Favicon path does not return an image');
      }

      console.log('[Favicon]', `[second: ${finalUrl}]`, 'success: image found');
      return this.sendImage(ctx, favicon);
    } catch (error) {
      const errorMessage = error?.message || 'Unable to retrieve favicon';
      console.log('[Favicon]', `[second: ${finalUrl}], error:`, errorMessage);
      return this.sendDefaultImage(ctx);
    }
  }

  private buildFaviconUrl(url: string, faviconPath: string) {
    const { origin } = new URL(url);
    if (faviconPath.startsWith('/')) {
      // https://example.com + /favicon.ico
      return origin + faviconPath;
    }
    // https://example.com/a/b?c=d -> https://example.com/a/b
    const slimUrl = this.urlWithoutSearchParams(url);

    // https://example.com/a/b/ -> https://example.com/a/b
    const newUrl = slimUrl.endsWith('/') ? slimUrl.slice(0, -1) : slimUrl;
    if (newUrl === origin) {
      return `${newUrl}/${faviconPath}`;
    }

    // https://example.com/a/b or https://example.com/a/b/cdef  -> https://example.com/a/
    const relativeUrl = this.removeLastSectionUrl(newUrl) + '/';
    if (relativeUrl.endsWith('/')) {
      return relativeUrl + faviconPath;
    }

    // https://example.com/a -> https://example.com/a/favicon.ico
    return `${relativeUrl}/${faviconPath}`;
  }

  private urlWithoutSearchParams(url: string) {
    const newUrl = new URL(url);
    return newUrl.protocol + '//' + newUrl.host + newUrl.pathname;
  }

  private removeLastSectionUrl(url: string) {
    const urlArr = url.split('/');
    urlArr.pop();
    return urlArr.join('/');
  }

  private findFaviconPath(text: string) {
    const document = parse(text);
    const favicon = Array.from(document.getElementsByTagName('link')).find(
      (element) =>
        element &&
        this.relList.includes(element.getAttribute('rel')!) &&
        element.getAttribute('href')
    );

    return favicon?.getAttribute('href') || undefined;
  }

  private async getFavicon(url: string): Promise<Favicon> {
    if (!url) throw new Error('Missing URL');

    const favicon = await this.downloadImageFromUrl(url);
    if (!this.isImage(favicon.type) || favicon.size === 0) {
      throw new Error('Favicon path does not return an image');
    }

    return favicon;
  }

  private async makeRequestWithUserAgent(url: string) {
    const headers = new Headers();
    headers.set('User-Agent', this.userAgent);

    return await fetch(url, { headers });
  }

  private async downloadImageFromUrl(url: string): Promise<Favicon> {
    const request = await this.makeRequestWithUserAgent(url);
    if (!request.ok) {
      throw new Error('Request failed');
    }

    const blob = await request.blob();
    return {
      buffer: Buffer.from(await blob.arrayBuffer()),
      url: request.url,
      type: blob.type,
      size: blob.size,
    };
  }

  private isImage = (type: string) => type.includes('image');

  private isBase64Image = (data: string) => data.startsWith('data:image/');

  private convertBase64ToBuffer = (base64: string) =>
    Buffer.from(base64, 'base64');

  private sendImage(ctx: HttpContext, { buffer, type, size }: Favicon) {
    console.log('ouiiiiiiii', type, size);
    ctx.response.header('Content-Type', type);
    ctx.response.header('Content-Length', size);
    ctx.response.send(buffer);
  }

  private sendDefaultImage(ctx: HttpContext) {
    console.log('oui');
    const readStream = createReadStream(
      resolve(process.cwd(), './public/empty-image.png')
    );
    ctx.response.writeHead(206);
    ctx.response.stream(readStream);
  }
}
