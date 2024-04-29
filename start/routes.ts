import PATHS from '#constants/paths';
import { middleware } from '#start/kernel';
import router from '@adonisjs/core/services/router';

const CollectionsController = () =>
  import('#controllers/collections_controller');
const UsersController = () => import('#controllers/users_controller');
const AppsController = () => import('#controllers/apps_controller');

router.get(PATHS.HOME, [AppsController, 'index']);
router.get(PATHS.AUTH.LOGIN, [UsersController, 'login']);
router.get(PATHS.AUTH.GOOGLE, [UsersController, 'google']);
router.get('/auth/callback', [UsersController, 'callbackAuth']);

router
  .group(() => {
    router.get(PATHS.AUTH.LOGOUT, [UsersController, 'logout']);
    router.get(PATHS.DASHBOARD, [CollectionsController, 'index']);

    router.get(PATHS.COLLECTION.CREATE, [
      CollectionsController,
      'showCreatePage',
    ]);
    router.post('/collections', [CollectionsController, 'store']);
  })
  .middleware([middleware.auth()]);
