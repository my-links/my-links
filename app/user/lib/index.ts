import { type DisplayPreferences } from '#shared/types/index';
import User from '#user/models/user';

export function ensureDisplayPreferences(user: User): DisplayPreferences {
	const defaults: DisplayPreferences = {
		linkListDisplay: 'grid',
		collectionListDisplay: 'list',
	};

	user.displayPreferences = { ...defaults, ...user.displayPreferences };
	return user.displayPreferences;
}
