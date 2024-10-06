import { middleware } from '#start/kernel';
import router from '@adonisjs/core/services/router';

const AdminController = () => import('#controllers/admin_controller');

/**
 * Routes for admin dashboard
 */
router
	.group(() => {
		router.get('/', [AdminController, 'index']).as('admin.dashboard');
	})
	.middleware([middleware.auth(), middleware.admin()])
	.prefix('/admin');
