import router from '@adonisjs/core/services/router';

import { middleware } from '#start/kernel';
import { apiThrottle } from '#start/limiter';
import { controllers } from '#generated/controllers';

router
	.group(() => {
		router.get('', [controllers.api.sync.Sync, 'render']).as('api-sync.delta');
	})
	.prefix('/api/v1/sync')
	.middleware([middleware.auth({ guards: ['api'] }), apiThrottle]);
