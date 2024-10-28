import { getRoute } from '#lib/tuyau';
import { QueryParams } from '#types/query_params';
import { RouteName, RouteParams } from '#types/tuyau';
import { Response } from '@adonisjs/core/http';

type RouteOptions = {
	params?: RouteParams;
} & QueryParams;

declare module '@adonisjs/core/http' {
	export interface Response {
		redirectToNamedRoute: (
			routeName: RouteName,
			options?: RouteOptions
		) => void;
	}
}

Response.macro(
	'redirectToNamedRoute',
	function (this: Response, routeName, options) {
		const route = getRoute(routeName, options);
		this.redirect().toRoute(route.path, route.params, options);
	}
);
