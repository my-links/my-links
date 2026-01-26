import { middleware } from '#start/kernel';
import router from '@adonisjs/core/services/router';

const ShowUserSettingsController = () =>
	import('#controllers/user_settings/show_user_settings_controller');
const ExportUserDataController = () =>
	import('#controllers/user_settings/export_user_data_controller');
const ImportUserDataController = () =>
	import('#controllers/user_settings/import_user_data_controller');

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
	})
	.use(middleware.auth());
