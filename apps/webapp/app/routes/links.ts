import router from '@adonisjs/core/services/router';

import { middleware } from '#start/kernel';
import { apiThrottle } from '#start/limiter';
import { controllers } from '#generated/controllers';

/**
 * Click-counting redirect, deliberately outside the auth group: links in
 * public collections are reachable by anonymous visitors, and their clicks
 * have to be counted the same way as the owner's. The global silent auth
 * middleware still resolves the visitor when there is a session.
 *
 * Throttled because it is an unauthenticated write — the shared `api`
 * limiter falls back to the client IP when there is no user.
 */
router
	.get('/l/:id', [controllers.links.VisitLink, 'execute'])
	.as('link.visit')
	.use(apiThrottle);

router
	.group(() => {
		router.get('/', [controllers.links.GetLinks, 'render']).as('link.index');

		router
			.post('/', [controllers.links.CreateLink, 'execute'])
			.as('link.create');

		router
			.put('/:id', [controllers.links.UpdateLink, 'execute'])
			.as('link.edit');

		router
			.put('/:id/favorite', [controllers.links.ToggleFavorite, 'execute'])
			.as('link.toggle-favorite');

		router
			.put('/:id/collection', [controllers.links.MoveLink, 'execute'])
			.as('link.move-to-collection');

		router
			.post('/:id/collections', [
				controllers.links.AddLinkToCollection,
				'execute',
			])
			.as('link.add-to-collection');

		router
			.delete('/:id', [controllers.links.DeleteLink, 'execute'])
			.as('link.delete');
	})
	.middleware([middleware.auth()])
	.prefix('/links');
