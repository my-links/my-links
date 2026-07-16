import router from '@adonisjs/core/services/router';

import { middleware } from '#start/kernel';
import { controllers } from '#generated/controllers';

router
	.group(() => {
		router.get('/search', [controllers.search.Search, 'render']).as('search');
	})
	.middleware([middleware.auth()]);
