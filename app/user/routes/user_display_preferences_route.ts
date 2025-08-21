import { middleware } from '#start/kernel';
import router from '@adonisjs/core/services/router';

const DisplayPreferencesController = () =>
	import('#user/controllers/display_preferences_controller');

router
	.post('/user/display-preferences', [DisplayPreferencesController, 'update'])
	.as('user.update-display-preferences')
	.middleware([middleware.auth()]);
