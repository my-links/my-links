import router from '@adonisjs/core/services/router';

import { controllers } from '#generated/controllers';
import { middleware } from '#start/kernel';

router
	.group(() => {
		router
			.get('/authorize', [controllers.extension.AuthorizeExtension, 'render'])
			.as('extension.authorize');
		router
			.post('/authorize', [controllers.extension.AuthorizeExtension, 'execute'])
			.as('extension.authorize.submit');
	})
	.prefix('/extension')
	.middleware([middleware.auth()]);
