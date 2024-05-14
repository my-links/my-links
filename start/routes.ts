import PATHS from '#constants/paths';
import { middleware } from '#start/kernel';
import router from '@adonisjs/core/services/router';

const LinksController = () => import('#controllers/links_controller');
const CollectionsController = () =>
  import('#controllers/collections_controller');
const UsersController = () => import('#controllers/users_controller');
const AppsController = () => import('#controllers/apps_controller');
const FaviconsController = () => import('#controllers/favicons_controller');

router.get(PATHS.HOME, [AppsController, 'index']);
router.post('/user/theme', [AppsController, 'updateUserTheme']);
router.get(PATHS.AUTH.LOGIN, [UsersController, 'login']);
router.get(PATHS.AUTH.GOOGLE, [UsersController, 'google']);
router.get('/auth/callback', [UsersController, 'callbackAuth']);
router.get('/favicon', [FaviconsController, 'index']);

router
  .group(() => {
    router.get(PATHS.AUTH.LOGOUT, [UsersController, 'logout']);
    router.get(PATHS.DASHBOARD, [CollectionsController, 'index']);

    router.get(PATHS.COLLECTION.CREATE, [
      CollectionsController,
      'showCreatePage',
    ]);
    router.post('/collections', [CollectionsController, 'store']);

    router.get(PATHS.COLLECTION.EDIT, [CollectionsController, 'showEditPage']);
    router.put('/collections/:id', [CollectionsController, 'update']);

    router.get(PATHS.LINK.CREATE, [LinksController, 'showCreatePage']);
    router.post('/links', [LinksController, 'store']);
  })
  .middleware([middleware.auth()]);
