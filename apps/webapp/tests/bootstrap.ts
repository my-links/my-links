import { assert } from '@japa/assert';
import { apiClient } from '@japa/api-client';
import app from '@adonisjs/core/services/app';
import type { Config } from '@japa/runner/types';
import { pluginAdonisJS } from '@japa/plugin-adonisjs';
import { dbAssertions } from '@adonisjs/lucid/plugins/db';
import testUtils from '@adonisjs/core/services/test_utils';
import { authApiClient } from '@adonisjs/auth/plugins/api_client';
import { shieldApiClient } from '@adonisjs/shield/plugins/api_client';
import { inertiaApiClient } from '@adonisjs/inertia/plugins/api_client';
import { sessionApiClient } from '@adonisjs/session/plugins/api_client';

import type { Registry } from '../.adonisjs/client/registry/schema.d.ts';

declare module '@japa/api-client/types' {
	interface RoutesRegistry extends Registry {}
}

export const plugins: Config['plugins'] = [
	assert(),
	pluginAdonisJS(app),
	apiClient(),
	sessionApiClient(app),
	// CSRF protection is on for the session-guarded webapp routes, so a
	// functional test exercising one needs `withCsrfToken()` to get past
	// shield instead of a silent 403.
	shieldApiClient(),
	authApiClient(app),
	// `withInertia()` sends the asset-version header alongside `x-inertia`;
	// without it Inertia answers 409 (version mismatch) instead of rendering.
	inertiaApiClient(app),
	dbAssertions(app),
];

export const runnerHooks: Required<Pick<Config, 'setup' | 'teardown'>> = {
	setup: [],
	teardown: [],
};

export const configureSuite: Config['configureSuite'] = (suite) => {
	if (['browser', 'functional', 'e2e'].includes(suite.name)) {
		return suite.setup(() => testUtils.httpServer().start());
	}
};
