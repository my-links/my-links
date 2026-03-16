import { middleware } from '#start/kernel';
import router from '@adonisjs/core/services/router';

export const apiGroup = (callback: () => void) =>
	router
		.group(callback)
		.prefix('/api/v1')
		.middleware([middleware.cors(), middleware.auth({ guards: ['api'] })]);
