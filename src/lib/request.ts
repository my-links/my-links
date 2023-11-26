import nProgress from 'nprogress';
import { i18n } from 'next-i18next';
import { USER_AGENT } from 'constants/url';
import { Favicon } from 'types/types';
import { isImage } from './image';

export async function makeRequest({
  method = 'GET',
  url,
  body,
}: {
  method?: RequestInit['method'];
  url: string;
  body?: object | any[];
}): Promise<any> {
  nProgress.start();
  const request = await fetch(url, {
    method,
    body: body ? JSON.stringify(body) : undefined,
    headers: {
      'Content-Type': 'application/json',
    },
  });
  nProgress.done();

  const data = await request.json();
  return request.ok
    ? data
    : Promise.reject(data?.error || i18n.t('common:generic-error'));
}

export async function makeRequestWithUserAgent(url: string) {
  const headers = new Headers();
  headers.set('User-Agent', USER_AGENT);

  return await fetch(url, { headers });
}

export async function downloadImageFromUrl(url: string): Promise<Favicon> {
  const request = await makeRequestWithUserAgent(url);
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

export async function getFavicon(url: string): Promise<Favicon> {
  if (!url) throw new Error('Missing URL');

  const favicon = await downloadImageFromUrl(url);
  if (!isImage(favicon.type) || favicon.size === 0) {
    throw new Error('Favicon path does not return an image');
  }

  return favicon;
}
