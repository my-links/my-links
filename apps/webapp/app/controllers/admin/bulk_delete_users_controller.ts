import { inject } from '@adonisjs/core';
import type { HttpContext } from '@adonisjs/core/http';

import { UserService } from '#services/user/user_service';
import { bulkDeleteUsersValidator } from '#validators/admin/bulk_delete_users_validator';

@inject()
export default class BulkDeleteUsersController {
	constructor(protected readonly userService: UserService) {}

	async execute({ request, response, auth }: HttpContext) {
		const { userIds } = await request.validateUsing(bulkDeleteUsersValidator);
		await this.userService.bulkRequestAccountDeletion(
			userIds,
			auth.getUserOrFail().id
		);
		return response.redirect().back();
	}
}
