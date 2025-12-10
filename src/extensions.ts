import { Response } from '@adonisjs/core/http';
import { getRoute } from '#lib/route_helper';
import type { ApiRouteName } from '#shared/types/index';

type RouteOptions = {
	params?: Record<string, string | number>;
	qs?: Record<string, string | number>;
};

declare module '@adonisjs/core/http' {
	export interface Response {
		redirectToNamedRoute: (
			routeName: ApiRouteName,
			options?: RouteOptions
		) => void;
	}
}

Response.macro(
	'redirectToNamedRoute',
	function (this: Response, routeName, options) {
		const routeInfo = getRoute(routeName, options);
		this.redirect(routeInfo.url);
	}
);
