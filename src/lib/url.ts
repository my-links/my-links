import { parse } from 'node-html-parser';
import { REL_LIST } from 'constants/url';

export function buildFaviconUrl(urlParam: string, faviconPath: string) {
  const { origin } = new URL(urlParam);
  if (faviconPath.startsWith('/')) {
    // https://example.com + /favicon.ico
    return origin + faviconPath;
  }
  // https://example.com/a/b?c=d -> https://example.com/a/b
  const slimUrl = urlWithoutSearchParams(urlParam);

  // https://example.com/a/b/ -> https://example.com/a/b
  const url = slimUrl.endsWith('/') ? slimUrl.slice(0, -1) : slimUrl;
  if (url === origin) {
    return `${url}/${faviconPath}`;
  }

  // https://example.com/a/b or https://example.com/a/b/cdef  -> https://example.com/a/
  const relativeUrl = removeLastSectionUrl(url) + '/';
  if (relativeUrl.endsWith('/')) {
    return relativeUrl + faviconPath;
  }

  // https://example.com/a -> https://example.com/a/favicon.ico
  return `${relativeUrl}/${faviconPath}`;
}

function urlWithoutSearchParams(urlParam: string) {
  const url = new URL(urlParam);
  return url.protocol + '//' + url.host + url.pathname;
}

export function removeLastSectionUrl(urlParam: string) {
  const urlArr = urlParam.split('/');
  urlArr.pop();
  return urlArr.join('/');
}

export function findFaviconPath(text: string) {
  const document = parse(text);
  const favicon = Array.from(document.getElementsByTagName('link')).find(
    (element) =>
      REL_LIST.includes(element.getAttribute('rel')) &&
      element.getAttribute('href'),
  );

  return favicon?.getAttribute('href') || undefined;
}

export function isValidHttpUrl(urlParam: string) {
  let url;

  try {
    url = new URL(urlParam);
  } catch (_) {
    return false;
  }

  return url.protocol === 'http:' || url.protocol === 'https:';
}
