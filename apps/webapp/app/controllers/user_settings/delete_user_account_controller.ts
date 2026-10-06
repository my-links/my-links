import { inject } from '@adonisjs/core';
import { HttpContext } from '@adonisjs/core/http';

import { resolveRequestOrigin } from '#lib/request_origin';
import { AccountDeletionService } from '#services/user/account_deletion_service';

@inject()
export default class DeleteUserAccountController {
	constructor(
		protected readonly accountDeletionService: AccountDeletionService
	) {}

	async execute({ auth, request, response }: HttpContext) {
		const user = await auth.authenticate();
		await this.accountDeletionService.requestAccountDeletion(user.id, {
			origin: resolveRequestOrigin({ request }),
		});
		await auth.use('web').logout();
		return response.redirect().toRoute('home');
	}
}
