import router from '@adonisjs/core/services/router';

import { controllers } from '#generated/controllers';

router
	.get('/shared/:id', [
		controllers.sharedCollections.SharedCollections,
		'render',
	])
	.as('shared');
