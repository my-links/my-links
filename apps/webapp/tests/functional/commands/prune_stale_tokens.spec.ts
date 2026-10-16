import { DateTime } from 'luxon';
import { test } from '@japa/runner';
import ace from '@adonisjs/core/services/ace';
import testUtils from '@adonisjs/core/services/test_utils';

import OneTimeToken from '#models/one_time_token';
import { ONE_TIME_TOKEN_TYPE } from '#constants/auth';
import { createUser } from '#tests/factories/user_factory';
import PruneStaleTokens from '#commands/prune_stale_tokens';
import { captureConsoleOutput } from '#tests/helpers/console';

test.group('token:prune-stale', (group) => {
	group.each.setup(() => testUtils.db().wrapInGlobalTransaction());
	group.each.setup(captureConsoleOutput);

	test('should delete a one-time token expired well past retention', async ({
		assert,
	}) => {
		const user = await createUser({ emailPrefix: 'prune-tokens-command' });
		const token = await OneTimeToken.create({
			userId: user.id,
			type: ONE_TIME_TOKEN_TYPE.PASSWORD_RESET,
			tokenHash: `prune-command-hash-${Date.now()}`,
			newEmail: null,
			expiresAt: DateTime.now().minus({ days: 3 }),
			consumedAt: null,
		});

		const command = await ace.create(PruneStaleTokens, []);
		await command.exec();

		command.assertSucceeded();
		assert.isNull(await OneTimeToken.find(token.id));
	});
});
