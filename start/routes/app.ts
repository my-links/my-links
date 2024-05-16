import router from '@adonisjs/core/services/router';
const AppsController = () => import('#controllers/apps_controller');

/**
 * All routes for both logged and guest users
 */
router.group(() => {
  router.get('/', [AppsController, 'index']).as('home');
  router
    .post('/user/theme', [AppsController, 'updateUserTheme'])
    .as('user.theme');
});
