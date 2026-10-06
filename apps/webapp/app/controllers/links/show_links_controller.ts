import { inject } from '@adonisjs/core';
import { HttpContext } from '@adonisjs/core/http';

import LinkTransformer from '#transformers/link';
import { LinkService } from '#services/links/link_service';

@inject()
export default class ShowLinksController {
	constructor(protected readonly linkService: LinkService) {}

	public async render({ serialize, auth }: HttpContext) {
		const links = await this.linkService.getMyLinks(auth.getUserOrFail().id);
		return serialize(
			LinkTransformer.transform(links).useVariant('withCollections')
		);
	}
}
