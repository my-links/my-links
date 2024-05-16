import router from '@adonisjs/core/services/router';
const AppsController = () => import('#controllers/apps_controller');

/**
 * All routes for both logged and guest users
 */
router.group(() => {
  router.get('/', [AppsController, 'index']).as('home');
  router.get('/privacy', () => 'privacy').as('privacy');
  router.get('/terms', () => 'terms').as('terms');

  router
    .post('/user/theme', [AppsController, 'updateUserTheme'])
    .as('user.theme');
});
