import { inject } from '@adonisjs/core';
import { HttpContext } from '@adonisjs/core/http';

import { LinkVisitService } from '#services/links/link_visit_service';
import { visitLinkValidator } from '#validators/links/visit_link_validator';

@inject()
export default class RecordLinkVisitController {
	constructor(protected readonly linkVisitService: LinkVisitService) {}

	async execute({ request, response, auth }: HttpContext) {
		const { params } = await request.validateUsing(visitLinkValidator);

		const link = await this.linkVisitService.getVisitableLink(
			params.id,
			auth.user?.id
		);
		await this.linkVisitService.recordVisit(link.id);

		return response.noContent();
	}
}
