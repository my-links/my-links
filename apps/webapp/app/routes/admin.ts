import router from '@adonisjs/core/services/router';

import { middleware } from '#start/kernel';
import { controllers } from '#generated/controllers';

router
	.group(() => {
		router.get('/', [controllers.admin.Admin, 'render']).as('admin.dashboard');
		router
			.get('/status', [controllers.admin.Status, 'render'])
			.as('admin.status');

		router
			.post('/users/bulk-delete', [
				controllers.admin.BulkDeleteUsers,
				'execute',
			])
			.as('admin.users.bulkDelete');
	})
	.middleware([middleware.auth(), middleware.admin()])
	.prefix('/admin');
