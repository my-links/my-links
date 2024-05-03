import Collection from '#models/collection';

export const appendCollectionId = (
  url: string,
  collectionId?: Collection['id']
) => `${url}${collectionId && `?collectionId=${collectionId}`}}`;

export const appendResourceId = (url: string, resourceId?: string) =>
  `${url}${resourceId && `/${resourceId}`}}`;
