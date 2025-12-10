import { middleware } from '#start/kernel';
import router from '@adonisjs/core/services/router';

const AdminController = () => import('#controllers/admin/admin_controller');

router
	.group(() => {
		router.get('/', [AdminController, 'render']).as('admin.dashboard');
	})
	.middleware([middleware.auth(), middleware.admin()])
	.prefix('/admin');
