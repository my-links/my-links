import { controllers } from '#generated/controllers';
import { apiGroup } from '#routes/api/group';
import router from '@adonisjs/core/services/router';

apiGroup(() => {
	router
		.get('/health', [controllers.api.health.Health, 'render'])
		.as('api-health.index');
});
