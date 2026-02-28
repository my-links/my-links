import { controllers } from '#generated/controllers';
import { middleware } from '#start/kernel';
import router from '@adonisjs/core/services/router';

router
	.group(() => {
		router
			.get('/check', [controllers.api.tokens.ApiToken, 'render'])
			.as('api-tokens.index');
	})
	.prefix('/api/v1/tokens')
	.middleware([middleware.auth({ guards: ['api'] })]);
