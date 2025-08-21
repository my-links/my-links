import router from '@adonisjs/core/services/router';

const ShowUserSettingsController = () =>
	import('#user_settings/controllers/show_user_settings_controller');

router
	.get('/user/settings', [ShowUserSettingsController, 'render'])
	.as('user.settings');
