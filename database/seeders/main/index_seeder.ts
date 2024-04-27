import app from '@adonisjs/core/services/app';
import logger from '@adonisjs/core/services/logger';
import { BaseSeeder } from '@adonisjs/lucid/seeders';

export default class IndexSeeder extends BaseSeeder {
  private async seed(Seeder: { default: typeof BaseSeeder }) {
    /**
     * Do not run when not in a environment specified in Seeder
     */
    if (
      !Seeder.default.environment ||
      (!Seeder.default.environment.includes('development') && app.inDev) ||
      (!Seeder.default.environment.includes('testing') && app.inTest) ||
      (!Seeder.default.environment.includes('production') && app.inProduction)
    ) {
      return;
    }

    await new Seeder.default(this.client).run();
  }

  async run() {
    logger.info('Start user seed');
    await this.seed(await import('#database/seeders/user_seeder'));
    logger.info('User seed done');
    logger.info('Collection user seed');
    await this.seed(await import('#database/seeders/collection_seeder'));
    logger.info('Collection seed done');
    logger.info('Link user seed');
    await this.seed(await import('#database/seeders/link_seeder'));
    logger.info('Link seed done');
  }
}
