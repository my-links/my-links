import router from '@adonisjs/core/services/router';

const UsersController = () => import('#controllers/users_controller');
const AppsController = () => import('#controllers/apps_controller');

router.get('/', [AppsController, 'index']);

router.get('/auth/login', [UsersController, 'google']);
router.get('/auth/callback', [UsersController, 'callbackAuth']);
router.get('/auth/logout', [UsersController, 'logout']);
