import type Collection from '#models/collection';

export const appendCollectionId = (
  url: string,
  collectionId?: Collection['id'] | null | undefined
) => `${url}${collectionId ? `?collectionId=${collectionId}` : ''}`;

export const appendResourceId = (url: string, resourceId?: string) =>
  `${url}${resourceId ? `/${resourceId}` : ''}`;

export function isValidHttpUrl(urlParam: string) {
  let url;

  try {
    url = new URL(urlParam);
  } catch (_) {
    return false;
  }

  return url.protocol === 'http:' || url.protocol === 'https:';
}
