import { HttpContext } from '@adonisjs/core/http';

const HEADER_NAME = 'Service-Worker-Allowed';

export default class ServiceWorkerScopeExtender {
	async handle(
		{ request, response, logger }: HttpContext,
		next: () => Promise<void>
	) {
		if (request.url().startsWith('/assets/sw.js')) {
			response.header(HEADER_NAME, '/');
			logger.debug(
				`Header ${HEADER_NAME} for ${request.url()} set to ${response.getHeader(HEADER_NAME)}`
			);
		}
		await next();
	}
}
