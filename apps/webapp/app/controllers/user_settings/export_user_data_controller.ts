import { inject } from '@adonisjs/core';
import { HttpContext } from '@adonisjs/core/http';

import { resolveRequestOrigin } from '#lib/request_origin';
import { ExportImportService } from '#services/user/export_import_service';

@inject()
export default class ExportUserDataController {
	constructor(protected readonly exportImportService: ExportImportService) {}

	async execute({ auth, request, response }: HttpContext) {
		const user = auth.getUserOrFail();
		const data = await this.exportImportService.exportUserData(
			user.id,
			resolveRequestOrigin({ request })
		);

		const json = JSON.stringify(data, null, 2);
		const filename = `my-links-export-${new Date().toISOString().split('T')[0]}.json`;

		response.header('Content-Type', 'application/json');
		response.header(
			'Content-Disposition',
			`attachment; filename="${filename}"`
		);
		return response.send(json);
	}
}
