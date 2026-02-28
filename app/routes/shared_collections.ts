import { controllers } from '#generated/controllers';
import router from '@adonisjs/core/services/router';

router
	.get('/shared/:id', [
		controllers.sharedCollections.SharedCollections,
		'render',
	])
	.as('shared');
