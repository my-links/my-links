import router from '@adonisjs/core/services/router';
import server from '@adonisjs/core/services/server';

/**
 * The error handler is used to convert an exception
 * to a HTTP response.
 */
server.errorHandler(() => import('#exceptions/handler'));

/**
 * The server middleware stack runs middleware on all the HTTP
 * requests, even if there is no route registered for
 * the request URL.
 *
 * Shield sits here rather than on the router stack so that error pages carry
 * the same security headers as routed ones, and it brings the session along
 * because its CSRF guard reads from it. Static files never reach either:
 * `static_middleware` only calls `next()` when no file matched.
 */
server.use([
	() => import('#middleware/container_bindings_middleware'),
	() => import('@adonisjs/static/static_middleware'),
	() => import('#middleware/log_request'),
	() => import('@adonisjs/cors/cors_middleware'),
	() => import('@adonisjs/vite/vite_middleware'),
	() => import('#middleware/inertia_middleware'),
	() => import('@adonisjs/session/session_middleware'),
	() => import('@adonisjs/shield/shield_middleware'),
]);

/**
 * The router middleware stack runs middleware on all the HTTP
 * requests with a registered route.
 */
router.use([
	() => import('@adonisjs/core/bodyparser_middleware'),
	() => import('@adonisjs/auth/initialize_auth_middleware'),
	() => import('#middleware/auth/silent_auth_middleware'),
	() => import('#middleware/user/update_user_last_seen_middleware'),
]);

/**
 * Named middleware collection must be explicitly assigned to
 * the routes or the routes group.
 */
export const middleware = router.named({
	admin: () => import('#middleware/admin/is_admin_middleware'),
	guest: () => import('#middleware/auth/guest_middleware'),
	auth: () => import('#middleware/auth/auth_middleware'),
	sudo: () => import('#middleware/auth/sudo_mode_middleware'),
});
