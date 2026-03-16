import { controllers } from '#generated/controllers';
import router from '@adonisjs/core/services/router';

router.group(() => {
	router
		.get('/favicon', [controllers.favicons.Favicons, 'render'])
		.as('favicon');
});
