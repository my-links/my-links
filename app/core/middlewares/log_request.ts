import { HttpContext } from '@adonisjs/core/http';
import logger from '@adonisjs/core/services/logger';

export default class LogRequest {
	async handle({ request }: HttpContext, next: () => Promise<void>) {
		if (
			!request.url().startsWith('/node_modules') &&
			!request.url().startsWith('/inertia') &&
			!request.url().startsWith('/@vite') &&
			!request.url().startsWith('/@react-refresh') &&
			!request.url().includes('.ts')
		) {
			logger.debug(`[${request.method()}]: ${request.url()}`);
		}
		await next();
	}
}
