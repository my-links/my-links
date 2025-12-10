import router from '@adonisjs/core/services/router';

const ShowUserSettingsController = () =>
	import('#controllers/user_settings/show_user_settings_controller');

router
	.get('/user/settings', [ShowUserSettingsController, 'render'])
	.as('user.settings');
