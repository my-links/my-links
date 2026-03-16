import { controllers } from '#generated/controllers';
import { apiGroup } from '#routes/api/group';
import router from '@adonisjs/core/services/router';

apiGroup(() => {
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
