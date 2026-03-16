import app from '@adonisjs/core/services/app';
import testUtils from '@adonisjs/core/services/test_utils';
import { assert } from '@japa/assert';
import { pluginAdonisJS } from '@japa/plugin-adonisjs';
import type { Config } from '@japa/runner/types';

export const plugins: Config['plugins'] = [assert(), pluginAdonisJS(app)];

export const runnerHooks: Required<Pick<Config, 'setup' | 'teardown'>> = {
	setup: [],
	teardown: [],
};

export const configureSuite: Config['configureSuite'] = (suite) => {
	if (['browser', 'functional', 'e2e'].includes(suite.name)) {
		return suite.setup(() => testUtils.httpServer().start());
	}
};
