import { inject } from '@adonisjs/core';
import { HttpContext } from '@adonisjs/core/http';

import LinkTransformer from '#transformers/link';
import { LinkService } from '#services/links/link_service';

@inject()
export default class GetFavoriteLinksController {
	constructor(protected readonly linkService: LinkService) {}

	public async render({ serialize }: HttpContext) {
		const links = await this.linkService.getMyFavoriteLinks();
		return serialize(LinkTransformer.transform(links));
	}
}
