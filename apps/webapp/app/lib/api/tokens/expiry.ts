import { DateTime } from 'luxon';

import {
	API_TOKEN_EXPIRY_DAYS,
	type ApiTokenExpiry,
} from '#constants/api_token';

export function resolveExpiryDate(expiry: ApiTokenExpiry): Date | undefined {
	const lifetimeDays = API_TOKEN_EXPIRY_DAYS[expiry];
	if (lifetimeDays === null) return undefined;

	return DateTime.now().plus({ days: lifetimeDays }).toJSDate();
}
