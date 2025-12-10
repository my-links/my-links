import { middleware } from '#start/kernel';
import router from '@adonisjs/core/services/router';

const ApiTokenController = () =>
	import('#controllers/api/tokens/api_token_controller');

router
	.group(() => {
		router.get('/check', [ApiTokenController, 'render']).as('api-tokens.index');
	})
	.prefix('/api/v1/tokens')
	.middleware([middleware.auth({ guards: ['api'] })]);
