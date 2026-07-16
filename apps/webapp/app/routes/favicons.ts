import router from '@adonisjs/core/services/router';

import { controllers } from '#generated/controllers';

router.group(() => {
	router
		.get('/favicon', [controllers.favicons.Favicons, 'render'])
		.as('favicon');
});
