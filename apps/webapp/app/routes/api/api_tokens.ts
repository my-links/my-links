import router from '@adonisjs/core/services/router';

import { controllers } from '#generated/controllers';
import { apiMiddleware } from '#routes/api/api_middleware';

router
	.group(() => {
		router
			.get('/check', [controllers.api.tokens.ApiToken, 'render'])
			.as('api-tokens.index');
	})
	.prefix('/api/v1/tokens')
	.middleware(apiMiddleware);
