import router from '@adonisjs/core/services/router';

const FaviconsController = () =>
	import('#controllers/favicons/favicons_controller');

router.group(() => {
	router.get('/favicon', [FaviconsController, 'render']).as('favicon');
});
