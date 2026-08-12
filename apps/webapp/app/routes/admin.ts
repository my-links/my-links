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
			.as('admin.auth-events');

		router
			.get('/activity-events', [controllers.admin.ActivityJournal, 'render'])
			.as('admin.activity-events');

		router
			.post('/users/bulk-delete', [
				controllers.admin.BulkDeleteUsers,
				'execute',
			])
			.as('admin.users.bulk-delete');

		router
			.post('/users/:id/password-reset', [
				controllers.admin.SendAccountPasswordReset,
				'execute',
			])
			.as('admin.users.send-password-reset');

		router
			.post('/users/:id/revoke-access', [
				controllers.admin.RevokeAccountAccess,
				'execute',
			])
			.as('admin.users.revoke-access');

		router
			.post('/users/:id/verify-email', [
				controllers.admin.VerifyAccountEmail,
				'execute',
			])
			.as('admin.users.verify-email');

		router
			.patch('/users/:id/role', [controllers.admin.SetAccountRole, 'execute'])
			.as('admin.users.set-role');
	})
	.middleware([middleware.auth(), middleware.admin()])
	.prefix('/admin');
