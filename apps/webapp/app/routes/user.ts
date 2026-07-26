import router from '@adonisjs/core/services/router';

import { middleware } from '#start/kernel';
import { controllers } from '#generated/controllers';

router
	.group(() => {
		router
			.post('/', [controllers.user.CreateApiToken, 'execute'])
			.as('user.api-tokens.store');
		router
			.delete('/:tokenId', [controllers.user.DeleteApiToken, 'execute'])
			.as('user.api-tokens.destroy');
	})
	.prefix('/user/api-tokens')
	.middleware([middleware.auth()]);

router
	.group(() => {
		router
			.delete('/:sessionId', [controllers.user.DestroySession, 'execute'])
			.as('user.sessions.destroy');
	})
	.prefix('/user/sessions')
	.middleware([middleware.auth()]);
