import router from '@adonisjs/core/services/router';

import { controllers } from '#generated/controllers';
import { apiThrottle } from '#start/limiter';

router
	.group(() => {
		router
			.get('', [controllers.api.health.ShowHealth, 'render'])
			.as('api-health.index');
	})
	.prefix('/api/v1/health')
	.middleware([apiThrottle]);
