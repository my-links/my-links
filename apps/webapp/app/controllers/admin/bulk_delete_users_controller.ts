import { inject } from '@adonisjs/core';
import type { HttpContext } from '@adonisjs/core/http';

import { resolveRequestOrigin } from '#lib/request_origin';
import { AccountDeletionService } from '#services/user/account_deletion_service';
import { bulkDeleteUsersValidator } from '#validators/admin/bulk_delete_users_validator';

@inject()
export default class BulkDeleteUsersController {
	constructor(
		protected readonly accountDeletionService: AccountDeletionService
	) {}

	async execute({ request, response, auth }: HttpContext) {
		const { userIds } = await request.validateUsing(bulkDeleteUsersValidator);
		await this.accountDeletionService.bulkRequestAccountDeletion(
			userIds,
			auth.getUserOrFail().id,
			resolveRequestOrigin({ request })
		);
		return response.redirect().back();
	}
}
