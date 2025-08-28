import UnAuthorizedException from '#api/tokens/exceptions/un_authorized_exception';
import { getTokenFromHeader } from '#api/tokens/lib/index';
import { inject } from '@adonisjs/core';
import { HttpContext } from '@adonisjs/core/http';

@inject()
export default class ApiTokenController {
	async index(ctx: HttpContext) {
		const token = getTokenFromHeader(ctx);
		if (!token) {
			throw new UnAuthorizedException();
		}

		return ctx.response.json({
			message: 'Token is valid',
		});
	}
}
