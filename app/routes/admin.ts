import { middleware } from '#start/kernel';
import router from '@adonisjs/core/services/router';

const AdminController = () => import('#controllers/admin/admin_controller');
const StatusController = () => import('#controllers/admin/status_controller');

router
	.group(() => {
		router.get('/', [AdminController, 'render']).as('admin.dashboard');
		router.get('/status', [StatusController, 'render']).as('admin.status');
	})
	.middleware([middleware.auth(), middleware.admin()])
	.prefix('/admin');
