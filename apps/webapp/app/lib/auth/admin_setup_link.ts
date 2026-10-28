import type { HttpRouterService } from '@adonisjs/core/types';

const REGISTER_ROUTE_NAME = 'auth.register';
const SETUP_TOKEN_QUERY_PARAMETER = 'setup_token';

/**
 * Built from the named register route so the logged link follows the route
 * wherever it moves.
 */
export function buildAdminSetupLink(
	router: HttpRouterService,
	appUrl: string,
	setupToken: string
): string {
	return router.makeUrl(
		REGISTER_ROUTE_NAME,
		{},
		{
			prefixUrl: appUrl,
			qs: { [SETUP_TOKEN_QUERY_PARAMETER]: setupToken },
		}
	);
}
