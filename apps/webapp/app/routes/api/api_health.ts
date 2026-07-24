import router from '@adonisjs/core/services/router';

import { apiThrottle } from '#start/limiter';
import { controllers } from '#generated/controllers';

router
	.group(() => {
		router
			.get('', [controllers.api.health.Health, 'render'])
			.as('api-health.index');
	})
	.prefix('/api/v1/health')
	.middleware([apiThrottle]);
