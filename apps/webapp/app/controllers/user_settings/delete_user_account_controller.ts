import { inject } from '@adonisjs/core';
import { HttpContext } from '@adonisjs/core/http';

import { UserService } from '#services/user/user_service';
import { resolveRequestOrigin } from '#lib/request_origin';

@inject()
export default class DeleteUserAccountController {
	constructor(protected readonly userService: UserService) {}

	async execute({ auth, request, response }: HttpContext) {
		const user = await auth.authenticate();
		await this.userService.requestAccountDeletion(user.id, {
			origin: resolveRequestOrigin({ request }),
		});
		await auth.use('web').logout();
		return response.redirect().toRoute('home');
	}
}
