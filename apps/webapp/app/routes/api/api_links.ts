import { controllers } from '#generated/controllers';
import { apiGroupAuth } from '#routes/groups/api_group';
import router from '@adonisjs/core/services/router';

apiGroupAuth(() => {
	router
		.post('/links', [controllers.api.links.CreateLink, 'execute'])
		.as('api-links.create');
	router
		.put('/links/:id', [controllers.api.links.UpdateLink, 'execute'])
		.as('api-links.update');
	router
		.delete('/links/:id', [controllers.api.links.DeleteLink, 'execute'])
		.as('api-links.delete');
});
