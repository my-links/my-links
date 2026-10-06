import { inject } from '@adonisjs/core';
import { HttpContext } from '@adonisjs/core/http';

import LinkTransformer from '#transformers/link';
import { LinkQueryService } from '#services/links/link_query_service';

@inject()
export default class ShowFavoriteLinksController {
	constructor(protected readonly linkQueryService: LinkQueryService) {}

	public async render({ serialize, auth }: HttpContext) {
		const links = await this.linkQueryService.getMyFavoriteLinks(
			auth.getUserOrFail().id
		);
		return serialize(
			LinkTransformer.transform(links).useVariant('withCollections')
		);
	}
}
