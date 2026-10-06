import router from '@adonisjs/core/services/router';

import { apiThrottle } from '#start/limiter';
import { controllers } from '#generated/controllers';

// Public and unauthenticated, so an amplifier for outbound requests: same profile and mitigation as /l/:id.
router.group(() => {
	router
		.get('/favicon', [controllers.favicons.Favicons, 'render'])
		.as('favicon')
		.use(apiThrottle);
});
