import { middleware } from '#start/kernel';
import router from '@adonisjs/core/services/router';

export const apiGroupAuth = (callback: () => void) =>
	router
		.group(callback)
		.prefix('/api/v1')
		.use(middleware.auth({ guards: ['api'] }));

export const apiGroupNoAuth = (callback: () => void) =>
	router.group(callback).prefix('/api/v1');
