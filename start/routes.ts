import PATHS from '#constants/paths';
import router from '@adonisjs/core/services/router';

const UsersController = () => import('#controllers/users_controller');
const AppsController = () => import('#controllers/apps_controller');

router.get(PATHS.HOME, [AppsController, 'index']);

router.get(PATHS.AUTH.LOGIN, [UsersController, 'login']);
router.get(PATHS.AUTH.GOOGLE, [UsersController, 'google']);
router.get('/auth/callback', [UsersController, 'callbackAuth']);
router.get(PATHS.AUTH.LOGOUT, [UsersController, 'logout']);
