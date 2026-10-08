import { inject } from '@adonisjs/core';

import { FaviconResolutionService } from '#services/favicons/favicon_resolution_service';

@inject()
export class InertFaviconResolutionService extends FaviconResolutionService {
	// Background resolution outlives the request and would query the global test transaction after the test ends.
	override triggerResolution(): Promise<void> {
		return Promise.resolve();
	}
}
