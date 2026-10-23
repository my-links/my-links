import router from '@adonisjs/core/services/router';

import { controllers } from '#generated/controllers';
import { middleware } from '#start/kernel';

router
	.group(() => {
		router
			.get('/', [controllers.admin.ShowAdminDashboard, 'render'])
			.as('admin.dashboard');
		router
			.get('/status', [controllers.admin.ShowSystemStatus, 'render'])
			.as('admin.status');

		router
			.get('/favicons', [controllers.admin.ShowFaviconStats, 'render'])
			.as('admin.favicons');

		router
			.post('/favicons/purge-orphans', [
				controllers.admin.PurgeFaviconOrphans,
				'execute',
			])
			.as('admin.favicons.purge-orphans')
			.use(middleware.sudo());

		router
			.post('/favicons/flush', [controllers.admin.FlushFaviconCache, 'execute'])
			.as('admin.favicons.flush')
			.use(middleware.sudo());

		router
			.post('/favicons/reresolve-failures', [
				controllers.admin.ReresolveFaviconFailures,
				'execute',
			])
			.as('admin.favicons.reresolve-failures')
			.use(middleware.sudo());

		router
			.post('/favicons/reresolve-all', [
				controllers.admin.ReresolveAllFavicons,
				'execute',
			])
			.as('admin.favicons.reresolve-all')
			.use(middleware.sudo());

		router
			.get('/auth-events', [controllers.admin.ShowAuthJournal, 'render'])
			.as('admin.auth-events');

		router
			.get('/activity-events', [
				controllers.admin.ShowActivityJournal,
				'render',
			])
			.as('admin.activity-events');

		router
			.post('/users/bulk-delete', [
				controllers.admin.BulkDeleteUsers,
				'execute',
			])
			.as('admin.users.bulk-delete')
			.use(middleware.sudo());

		router
			.post('/users/:id/password-reset', [
				controllers.admin.SendAccountPasswordReset,
				'execute',
			])
			.as('admin.users.send-password-reset')
			.use(middleware.sudo());

		router
			.post('/users/:id/revoke-access', [
				controllers.admin.RevokeAccountAccess,
				'execute',
			])
			.as('admin.users.revoke-access')
			.use(middleware.sudo());

		router
			.post('/users/:id/verify-email', [
				controllers.admin.VerifyAccountEmail,
				'execute',
			])
			.as('admin.users.verify-email')
			.use(middleware.sudo());

		router
			.patch('/users/:id/role', [controllers.admin.SetAccountRole, 'execute'])
			.as('admin.users.set-role')
			.use(middleware.sudo());

		router
			.post('/users/:id/restore', [controllers.admin.RestoreAccount, 'execute'])
			.as('admin.users.restore')
			.use(middleware.sudo());
	})
	.middleware([middleware.auth(), middleware.admin()])
	.prefix('/admin');
