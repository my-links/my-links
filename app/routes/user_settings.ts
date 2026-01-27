import { middleware } from '#start/kernel';
import router from '@adonisjs/core/services/router';

const ShowUserSettingsController = () =>
	import('#controllers/user_settings/show_user_settings_controller');
const ExportUserDataController = () =>
	import('#controllers/user_settings/export_user_data_controller');
const ImportUserDataController = () =>
	import('#controllers/user_settings/import_user_data_controller');
const DeleteUserAccountController = () =>
	import('#controllers/user_settings/delete_user_account_controller');

router
	.group(() => {
		router
			.get('/user/settings', [ShowUserSettingsController, 'render'])
			.as('user.settings');

		router
			.get('/user/settings/export', [ExportUserDataController, 'execute'])
			.as('user.settings.export');

		router
			.post('/user/settings/import', [ImportUserDataController, 'execute'])
			.as('user.settings.import');

		router
			.delete('/user/settings/account', [
				DeleteUserAccountController,
				'execute',
			])
			.as('user.settings.delete');
	})
	.use(middleware.auth());
