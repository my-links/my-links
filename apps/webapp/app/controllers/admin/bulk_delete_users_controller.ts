import { UserService } from '#services/user/user_service';
import { bulkDeleteUsersValidator } from '#validators/admin/bulk_delete_users_validator';
import { inject } from '@adonisjs/core';
import type { HttpContext } from '@adonisjs/core/http';

@inject()
export default class BulkDeleteUsersController {
	constructor(protected readonly userService: UserService) {}

	async execute({ request, response }: HttpContext) {
		const { userIds } = await request.validateUsing(bulkDeleteUsersValidator);
		await this.userService.bulkDeleteUsers(userIds);
		return response.redirect().back();
	}
}
