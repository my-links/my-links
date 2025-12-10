import { LinkDto } from '#dtos/link';
import { LinkService } from '#services/links/link_service';
import { createLinkValidator } from '#validators/links/create_link_validator';
import { inject } from '@adonisjs/core';
import { HttpContext } from '@adonisjs/core/http';

@inject()
export default class CreateLinkController {
	constructor(private linkService: LinkService) {}

	async execute({ request, response }: HttpContext) {
		const { collectionId, ...payload } =
			await request.validateUsing(createLinkValidator);

		const link = await this.linkService.createLink({
			...payload,
			collectionId,
		});
		return response.json({
			message: 'Link created successfully',
			link: new LinkDto(link).serialize(),
		});
	}
}
