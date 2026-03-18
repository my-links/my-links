import { controllers } from '#generated/controllers';
import { apiGroupAuth } from '#routes/groups/api_group';
import router from '@adonisjs/core/services/router';

apiGroupAuth(() => {
	router
		.get('/collections', [controllers.api.collections.GetCollections, 'render'])
		.as('api-collections.index');
	router
		.post('/collections', [
			controllers.api.collections.CreateCollection,
			'execute',
		])
		.as('api-collections.create');
	router
		.put('/collections/:id', [
			controllers.api.collections.UpdateCollection,
			'execute',
		])
		.as('api-collections.update');
	router
		.delete('/collections/:id', [
			controllers.api.collections.DeleteCollection,
			'execute',
		])
		.as('api-collections.delete');
});
