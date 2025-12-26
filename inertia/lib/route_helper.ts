import { ApiRouteName } from '#shared/types/index';
import { useTuyauRequired } from '~/hooks/use_tuyau_required';

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

export const useRouteHelper = () => {
	const tuyau = useTuyauRequired();

	const route = (
		routeName: ApiRouteName,
		options?: RouteOptions
	): RouteResult => {
		const routeInfo = tuyau.$route(routeName, options?.params);
		if (!routeInfo) {
			throw new Error(`Route ${routeName} not found`);
		}

		let url = routeInfo.path;
		if (options?.qs) {
			const searchParams = new URLSearchParams();
			Object.entries(options.qs).forEach(([key, value]) => {
				searchParams.append(key, String(value));
			});
			url = `${url}?${searchParams.toString()}`;
		}

		const method = Array.isArray(routeInfo.method)
			? routeInfo.method[0]
			: routeInfo.method;

		return {
			url,
			path: routeInfo.path,
			method: typeof method === 'string' ? method.toLowerCase() : method,
			params: options?.params,
			qs: options?.qs,
		};
	};

	return { route };
};
