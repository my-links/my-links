import router from '@adonisjs/core/services/router';

const SharedCollectionsController = () =>
	import('#shared_collections/controllers/shared_collections_controller');

router.get('/shared/:id', [SharedCollectionsController, 'index']).as('shared');
