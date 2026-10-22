import router from '@adonisjs/core/services/router';

import { middleware } from '#start/kernel';
import { apiThrottle } from '#start/limiter';
import { controllers } from '#generated/controllers';

/**
 * Click beacon: records a visit and answers 204, never redirects. Deliberately
 * outside auth so the background recording needs no session; throttled by the
 * shared `api` limiter, which falls back to the client IP.
 */
router
	.post('/l/:id', [controllers.links.RecordLinkVisit, 'execute'])
	.as('link.record-visit')
	.use(apiThrottle);

router
	.group(() => {
		router.get('/', [controllers.links.ShowLinks, 'render']).as('link.index');

		router
			.post('/', [controllers.links.CreateLink, 'execute'])
			.as('link.create');

		router
			.put('/:id', [controllers.links.UpdateLink, 'execute'])
			.as('link.edit');

		router
			.put('/:id/favorite', [controllers.links.ToggleLinkFavorite, 'execute'])
			.as('link.toggle-favorite');

		router
			.post('/:id/favicon/refresh', [
				controllers.links.RefreshLinkFavicon,
				'execute',
			])
			.as('link.refresh-favicon');

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
