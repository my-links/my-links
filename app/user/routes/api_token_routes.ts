import { middleware } from '#start/kernel';
import router from '@adonisjs/core/services/router';

const ApiTokenController = () =>
	import('#user/controllers/api_token_controller');

router
	.group(() => {
		router.post('/', [ApiTokenController, 'store']).as('user.api-tokens.store');
		router
			.delete('/:tokenId', [ApiTokenController, 'destroy'])
			.as('user.api-tokens.destroy');
	})
	.prefix('/user/api-tokens')
	.middleware([middleware.auth()]);
