import { api } from '#adonisjs/api';
import { QueryParams } from '#types/query_params';
import { RouteName } from '#types/tuyau';

export const getRoute = (routeName: RouteName, options?: QueryParams) => {
	const current = api.routes.find((route) => route.name === routeName);
	if (!current) {
		throw new Error(`Route ${routeName} not found`);
	}

	if (options?.qs) {
		const searchParams = new URLSearchParams(options?.qs);
		return { ...current, path: `${current.path}?${searchParams.toString()}` };
	}

	return current;
};

export function getPath(routeName: RouteName, options?: QueryParams) {
	const current = getRoute(routeName, options);
	return current.path;
}
