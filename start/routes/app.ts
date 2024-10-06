import router from '@adonisjs/core/services/router';
const AppsController = () => import('#controllers/apps_controller');

/**
 * All routes for both logged and guest users
 */
router.group(() => {
	router.on('/').renderInertia('home').as('home');
	router.on('/terms').renderInertia('terms').as('terms');
	router.on('/privacy').renderInertia('privacy').as('privacy');

	router
		.post('/user/theme', [AppsController, 'updateUserTheme'])
		.as('user.theme');
});
