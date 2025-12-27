import { middleware } from '#start/kernel';
import router from '@adonisjs/core/services/router';

const ThemeController = () => import('#controllers/user/theme_controller');
const ApiTokenController = () =>
	import('#controllers/user/api_token_controller');

router.post('/user/theme', [ThemeController, 'render']).as('user.theme');

router
	.group(() => {
		router.post('/', [ApiTokenController, 'store']).as('user.api-tokens.store');
		router
			.delete('/:tokenId', [ApiTokenController, 'destroy'])
			.as('user.api-tokens.destroy');
	})
	.prefix('/user/api-tokens')
	.middleware([middleware.auth()]);
