import router from '@adonisjs/core/services/router';

import { controllers } from '#generated/controllers';
import { apiThrottle } from '#start/limiter';

// Public and unauthenticated, so an amplifier for outbound requests: same profile and mitigation as the POST /l/:id beacon.
router.group(() => {
	router
		.get('/favicon', [controllers.favicons.ShowFavicon, 'render'])
		.as('favicon')
		.use(apiThrottle);
});
