import { ExportImportService } from '#services/user/export_import_service';
import { importDataValidator } from '#validators/user_settings/import_data_validator';
import { inject } from '@adonisjs/core';
import { HttpContext } from '@adonisjs/core/http';
import { readFileSync } from 'node:fs';

@inject()
export default class ImportUserDataController {
	constructor(protected readonly exportImportService: ExportImportService) {}

	async execute({ auth, request, response }: HttpContext) {
		const user = auth.getUserOrFail();
		const file = request.file('file', {
			size: '10mb',
			extnames: ['json'],
		});

		if (!file?.isValid) {
			const errors = file?.errors?.[0]?.message ?? 'Invalid file';
			throw new Error(errors);
		}

		const fileContent = readFileSync(file.tmpPath!, 'utf-8');
		const jsonData = JSON.parse(fileContent);

		const validatedData = await importDataValidator.validate(jsonData);
		await this.exportImportService.importUserData(user.id, validatedData);

		return response.redirect().back();
	}
}
