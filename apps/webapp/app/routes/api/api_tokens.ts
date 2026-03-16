import { controllers } from '#generated/controllers';
import { apiGroup } from '#routes/api/group';
import router from '@adonisjs/core/services/router';

apiGroup(() => {
	router
		.get('/tokens/check', [controllers.api.tokens.ApiToken, 'render'])
		.as('api-tokens.index');
});
