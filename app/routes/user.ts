import { controllers } from '#generated/controllers';
import { middleware } from '#start/kernel';
import router from '@adonisjs/core/services/router';

router
	.group(() => {
		router
			.post('/', [controllers.user.ApiToken, 'store'])
			.as('user.api-tokens.store');
		router
			.delete('/:tokenId', [controllers.user.ApiToken, 'destroy'])
			.as('user.api-tokens.destroy');
	})
	.prefix('/user/api-tokens')
	.middleware([middleware.auth()]);
