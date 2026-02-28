import { controllers } from '#generated/controllers';
import { middleware } from '#start/kernel';
import router from '@adonisjs/core/services/router';

router
	.group(() => {
		router
			.get('/user/settings', [
				controllers.userSettings.ShowUserSettings,
				'render',
			])
			.as('user.settings');

		router
			.get('/user/settings/export', [
				controllers.userSettings.ExportUserData,
				'execute',
			])
			.as('user.settings.export');

		router
			.post('/user/settings/import', [
				controllers.userSettings.ImportUserData,
				'execute',
			])
			.as('user.settings.import');

		router
			.delete('/user/settings/account', [
				controllers.userSettings.DeleteUserAccount,
				'execute',
			])
			.as('user.settings.delete');
	})
	.use(middleware.auth());
