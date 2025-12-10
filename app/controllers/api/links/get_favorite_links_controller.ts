import { LinkDto } from '#dtos/link';
import { LinkService } from '#services/links/link_service';
import { inject } from '@adonisjs/core';
import { HttpContext } from '@adonisjs/core/http';

@inject()
export default class GetFavoriteLinksController {
	constructor(private linkService: LinkService) {}

	public async execute({ response }: HttpContext) {
		const links = await this.linkService.getFavoriteLinksForAuthenticatedUser();
		return response.json(LinkDto.fromArray(links));
	}
}
