import { controllers } from '#generated/controllers';
import { apiGroupAuth } from '#routes/groups/api_group';
import router from '@adonisjs/core/services/router';

apiGroupAuth(() => {
	router
		.get('/tokens/check', [controllers.api.tokens.ApiToken, 'render'])
		.as('api-tokens.index');
});
