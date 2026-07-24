import router from '@adonisjs/core/services/router';

import { middleware } from '#start/kernel';
import { apiThrottle } from '#start/limiter';
import { controllers } from '#generated/controllers';

router
	.group(() => {
		router
			.get('', [controllers.api.search.Search, 'render'])
			.as('api-search.index');
	})
	.prefix('/api/v1/search')
	.middleware([middleware.auth({ guards: ['api'] }), apiThrottle]);
