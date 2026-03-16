import { SessionService } from '#services/user/session_service';
import { deleteSessionValidator } from '#validators/user/session/delete_session';
import { inject } from '@adonisjs/core';
import type { HttpContext } from '@adonisjs/core/http';

@inject()
export default class DestroySessionController {
	constructor(protected readonly sessionService: SessionService) {}

	async execute({ request, response, auth }: HttpContext) {
		const user = await auth.authenticate();
		const { params } = await request.validateUsing(deleteSessionValidator);
		await this.sessionService.revokeSession(user, params.sessionId);
		return response.redirect().withQs().back();
	}
}
