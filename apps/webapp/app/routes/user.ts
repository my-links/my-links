import router from '@adonisjs/core/services/router';

import { controllers } from '#generated/controllers';
import { middleware } from '#start/kernel';

router
	.group(() => {
		router
			.post('/', [controllers.user.CreateApiToken, 'execute'])
			.as('user.api-tokens.store')
			.use(middleware.sudo());
		router
			.delete('/:tokenId', [controllers.user.DeleteApiToken, 'execute'])
			.as('user.api-tokens.destroy');
	})
	.prefix('/user/api-tokens')
	.middleware([middleware.auth()]);

router
	.group(() => {
		router
			.delete('/:publicId', [controllers.user.DeleteSession, 'execute'])
			.as('user.sessions.destroy');
	})
	.prefix('/user/sessions')
	.middleware([middleware.auth()]);
