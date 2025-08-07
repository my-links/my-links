import { Collection, CollectionWithLinks, Link } from '~/types/app';

export const appendCollectionId = (
	url: string,
	collectionId?: Collection['id'] | null | undefined
) => `${url}${collectionId ? `?collectionId=${collectionId}` : ''}`;

export const appendLinkId = (
	url: string,
	linkId?: Link['id'] | null | undefined
) => `${url}${linkId ? `?linkId=${linkId}` : ''}`;

export const appendResourceId = (
	url: string,
	resourceId?: Collection['id'] | Link['id']
) => `${url}${resourceId ? `/${resourceId}` : ''}`;

export function isValidHttpUrl(urlParam: string) {
	let url;

	try {
		url = new URL(urlParam);
	} catch (_) {
		return false;
	}

	return url.protocol === 'http:' || url.protocol === 'https:';
}

export const generateShareUrl = (
	collection: Collection | CollectionWithLinks
) => {
	const pathname = `/shared/${collection.id}`;
	if (typeof window === 'undefined') return pathname;
	return `${window.location.origin}${pathname}`;
};

export const buildUrl = (url: string, params: Record<string, string>) => {
	const urlObj = new URL(url);
	Object.entries(params).forEach(([key, value]) => {
		urlObj.searchParams.set(key, value);
	});
	return urlObj.toString();
};
