import { controllers } from '#generated/controllers';
import { middleware } from '#start/kernel';
import router from '@adonisjs/core/services/router';

router
	.group(() => {
		router.get('/search', [controllers.search.Search, 'render']).as('search');
	})
	.middleware([middleware.auth()]);
