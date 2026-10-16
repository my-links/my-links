import vine from '@vinejs/vine';

import { databaseIdSchema } from '#validators/rules/database_id_schema';

/**
 * Names the account an admin action applies to. Shared by the four of them, so
 * the route parameter is narrowed to a number in one place rather than each
 * controller reading `params.id` raw. Whether that account exists is the
 * lookup's answer to give.
 */
export const accountTargetValidator = vine.create(
	vine.object({
		id: databaseIdSchema,
	})
);
