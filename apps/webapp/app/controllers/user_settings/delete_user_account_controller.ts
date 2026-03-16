import { UserService } from '#services/user/user_service';
import { inject } from '@adonisjs/core';
import { HttpContext } from '@adonisjs/core/http';

@inject()
export default class DeleteUserAccountController {
	constructor(protected readonly userService: UserService) {}

	async execute({ auth, response }: HttpContext) {
		const user = await auth.authenticate();
		await this.userService.deleteUser(user.id);
		return response.redirect().toRoute('home');
	}
}
