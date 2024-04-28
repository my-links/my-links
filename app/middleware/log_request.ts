import { HttpContext } from '@adonisjs/core/http';
import logger from '@adonisjs/core/services/logger';

export default class LogRequest {
  async handle({ request }: HttpContext, next: () => Promise<void>) {
    logger.info(`-> ${request.method()}: ${request.url()}`);
    await next();
  }
}
