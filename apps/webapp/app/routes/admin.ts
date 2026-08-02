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
			.get('/auth-events', [controllers.admin.AuthJournal, 'render'])
			.as('admin.authEvents');

		router
			.get('/activity-events', [controllers.admin.ActivityJournal, 'render'])
			.as('admin.activityEvents');

		router
			.post('/users/bulk-delete', [
				controllers.admin.BulkDeleteUsers,
				'execute',
			])
			.as('admin.users.bulkDelete');

		router
			.post('/users/:id/password-reset', [
				controllers.admin.SendAccountPasswordReset,
				'execute',
			])
			.as('admin.users.sendPasswordReset');

		router
			.post('/users/:id/revoke-access', [
				controllers.admin.RevokeAccountAccess,
				'execute',
			])
			.as('admin.users.revokeAccess');

		router
			.post('/users/:id/verify-email', [
				controllers.admin.VerifyAccountEmail,
				'execute',
			])
			.as('admin.users.verifyEmail');

		router
			.patch('/users/:id/role', [controllers.admin.SetAccountRole, 'execute'])
			.as('admin.users.setRole');
	})
	.middleware([middleware.auth(), middleware.admin()])
	.prefix('/admin');
