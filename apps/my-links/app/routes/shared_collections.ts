import router from '@adonisjs/core/services/router';

const SharedCollectionsController = () =>
	import('#controllers/shared_collections/shared_collections_controller');

router.get('/shared/:id', [SharedCollectionsController, 'render']).as('shared');
