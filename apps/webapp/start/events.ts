/*
|--------------------------------------------------------------------------
| Application events
|--------------------------------------------------------------------------
|
| Listeners for events emitted outside of a request lifecycle, where nothing
| else would report a failure.
|
*/

import logger from '@adonisjs/core/services/logger';
import emitter from '@adonisjs/core/services/emitter';

import { pickDeliveryDiagnostics } from '#lib/logging/delivery_diagnostics';

/**
 * Emails are queued rather than awaited, so a delivery failure happens long
 * after the request that triggered it has answered. This listener is the only
 * thing standing between a misconfigured relay and an instance that silently
 * never sends the verification email its users are waiting for.
 */
emitter.on('queued:mail:error', ({ error, mailerName }) => {
	logger.error(
		{ mailerName, ...pickDeliveryDiagnostics(error) },
		'Queued email delivery failed'
	);
	logger.debug(
		{ err: error, mailerName },
		'Queued email delivery failure detail'
	);
});
