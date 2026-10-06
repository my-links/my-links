import { inject } from '@adonisjs/core';
import type { HttpContext } from '@adonisjs/core/http';

import { SessionService } from '#services/user/session_service';
import { deleteSessionValidator } from '#validators/user/session/delete_session';

@inject()
export default class DeleteSessionController {
	constructor(protected readonly sessionService: SessionService) {}

	async execute({ request, response, auth, session }: HttpContext) {
		const user = await auth.authenticate();
		const { params } = await request.validateUsing(deleteSessionValidator);

		// Deleting the row directly wouldn't sign out the request that's running it.
		if (params.sessionId === session.sessionId) {
			await auth.use('web').logout();
			return response.redirect().withQs().back();
		}

		await this.sessionService.revokeSession(user, params.sessionId);
		return response.redirect().withQs().back();
	}
}
