import { api } from '#adonis/api';
import type { ApiRouteName } from '#shared/types/index';

type RouteOptions = {
	params?: Record<string, string | number>;
	qs?: Record<string, string | number>;
};

type RouteResult = {
	url: string;
	path: string;
	method: string;
	params?: Record<string, string | number>;
	qs?: Record<string, string | number>;
};

export const getRoute = (
	routeName: ApiRouteName,
	options?: RouteOptions
): RouteResult => {
	const routeInfo = api.routes.find((r) => r.name === routeName);
	if (!routeInfo) {
		throw new Error(`Route ${routeName} not found`);
	}

	let path: string = routeInfo.path;
	if (options?.params && routeInfo.params.length > 0) {
		routeInfo.params.forEach((paramName) => {
			const paramValue = options.params?.[paramName];
			if (paramValue !== undefined) {
				path = path.replace(`:${paramName}`, String(paramValue));
			}
		});
	}

	let url: string = path;
	if (options?.qs) {
		const searchParams = new URLSearchParams();
		Object.entries(options.qs).forEach(([key, value]) => {
			searchParams.append(key, String(value));
		});
		url = `${url}?${searchParams.toString()}`;
	}

	return {
		url,
		path,
		method: routeInfo.method[0] || 'GET',
		params: options?.params,
		qs: options?.qs,
	};
};
