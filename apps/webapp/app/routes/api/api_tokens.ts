import router from '@adonisjs/core/services/router';

import { controllers } from '#generated/controllers';
import {
	apiMiddleware,
	tokenSelfRevocationMiddleware,
} from '#routes/api/api_middleware';

router
	.group(() => {
		router
			.get('/check', [controllers.api.tokens.CheckApiToken, 'render'])
			.as('api-tokens.index');
	})
	.prefix('/api/v1/tokens')
	.middleware(apiMiddleware);

router
	.delete('/api/v1/tokens/current', [
		controllers.api.tokens.RevokeCurrentApiToken,
		'execute',
	])
	.as('api-tokens.revoke-current')
	.middleware(tokenSelfRevocationMiddleware);
