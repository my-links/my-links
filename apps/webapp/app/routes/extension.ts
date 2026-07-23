import router from '@adonisjs/core/services/router';

import { middleware } from '#start/kernel';
import { controllers } from '#generated/controllers';

router
	.group(() => {
		router
			.get('/authorize', [controllers.extension.AuthorizeExtension, 'render'])
			.as('extension.authorize');
	})
	.prefix('/extension')
	.middleware([middleware.auth()]);
