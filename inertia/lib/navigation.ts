import { tuyau } from '~/lib/tuyau';
import { Collection, Link } from '~/types/app';
import { RouteName } from '~/types/tuyau';

export const routeWithCollectionId = (
	routeName: RouteName,
	collectionId?: Collection['id'] | null | undefined
) =>
	buildUrlWithQueryParams(routeName, {
		collectionId,
	});

export const routeWithLinkId = (
	routeName: RouteName,
	linkId?: Link['id'] | null | undefined
) => buildUrlWithQueryParams(routeName, { linkId });

export const routeWithResourceId = (
	routeName: RouteName,
	resourceId?: Collection['id'] | Link['id']
) => `${routeName}${resourceId ? `/${resourceId}` : ''}`;

export function buildUrlWithQueryParams(
	routeName: RouteName,
	queryParam: Record<string, string | number | null | undefined>
) {
	const path = tuyau.$route(routeName).path;
	const [key, value] = Object.entries(queryParam)[0];
	if (!value) {
		return path;
	}

	const searchParams = new URLSearchParams({
		[key]: value.toString(),
	});
	return `${path}?${searchParams}`;
}

export const getRoute = (routeName: RouteName) => tuyau.$route(routeName);
export const getPath = (routeName: RouteName) => getRoute(routeName).path;

export function isValidHttpUrl(urlParam: string) {
	let url;

	try {
		url = new URL(urlParam);
	} catch (_) {
		return false;
	}

	return url.protocol === 'http:' || url.protocol === 'https:';
}
