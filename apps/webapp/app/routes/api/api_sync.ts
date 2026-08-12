import router from '@adonisjs/core/services/router';

import { controllers } from '#generated/controllers';
import { apiMiddleware } from '#routes/api/api_middleware';

router
	.group(() => {
		router.get('', [controllers.api.sync.Sync, 'render']).as('api-sync.delta');
	})
	.prefix('/api/v1/sync')
	.middleware(apiMiddleware);
