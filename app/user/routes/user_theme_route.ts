import router from '@adonisjs/core/services/router';

const ThemeController = () => import('#user/controllers/theme_controller');

router.post('/user/theme', [ThemeController, 'index']).as('user.theme');
