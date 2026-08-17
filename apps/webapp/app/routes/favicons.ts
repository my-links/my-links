import router from '@adonisjs/core/services/router';

import { apiThrottle } from '#start/limiter';
import { controllers } from '#generated/controllers';

// Public and unauthenticated (serves favicons for anonymous /shared/:id
// visitors too), which makes it an amplifier for outbound requests — same
// profile as /l/:id, same mitigation.
router.group(() => {
	router
		.get('/favicon', [controllers.favicons.Favicons, 'render'])
		.as('favicon')
		.use(apiThrottle);
});
