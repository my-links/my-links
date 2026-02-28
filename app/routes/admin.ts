import { controllers } from '#generated/controllers';
import { middleware } from '#start/kernel';
import router from '@adonisjs/core/services/router';

router
	.group(() => {
		router.get('/', [controllers.admin.Admin, 'render']).as('admin.dashboard');
		router
			.get('/status', [controllers.admin.Status, 'render'])
			.as('admin.status');
	})
	.middleware([middleware.auth(), middleware.admin()])
	.prefix('/admin');
