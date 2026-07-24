import router from '@adonisjs/core/services/router';

import { middleware } from '#start/kernel';
import { apiThrottle } from '#start/limiter';
import { controllers } from '#generated/controllers';

router
	.group(() => {
		router
			.get('/check', [controllers.api.tokens.ApiToken, 'render'])
			.as('api-tokens.index');
	})
	.prefix('/api/v1/tokens')
	.middleware([middleware.auth({ guards: ['api'] }), apiThrottle]);
