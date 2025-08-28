import { middleware } from '#start/kernel';
import router from '@adonisjs/core/services/router';

const ApiTokenController = () =>
	import('#api/tokens/controllers/api_token_controller');

router
	.group(() => {
		router.get('/check', [ApiTokenController, 'index']).as('api-tokens.index');
	})
	.prefix('/api/v1/tokens')
	.middleware([middleware.auth({ guards: ['api'] })]);
