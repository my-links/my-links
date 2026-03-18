import { controllers } from '#generated/controllers';
import { apiGroupNoAuth } from '#routes/groups/api_group';
import router from '@adonisjs/core/services/router';

apiGroupNoAuth(() => {
	router
		.get('/health', [controllers.api.health.Health, 'render'])
		.as('api-health.index');
});
