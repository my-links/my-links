import { Exception } from '@adonisjs/core/exceptions';
import { HttpContext } from '@adonisjs/core/http';
import logger from '@adonisjs/core/services/logger';
import { createReadStream } from 'node:fs';
import { resolve } from 'node:path';

export default class FaviconNotFoundException extends Exception {
  static status = 404;
  static code = 'E_FAVICON_NOT_FOUND';

  async handle(error: this, ctx: HttpContext) {
    const readStream = createReadStream(
      resolve(process.cwd(), './public/empty-image.png')
    );

    ctx.response.header('Content-Type', 'image/png');
    ctx.response.stream(readStream);
    logger.debug(error.message);
  }
}
