import { inject } from '@adonisjs/core';
import { readFile } from 'node:fs/promises';
import { HttpContext } from '@adonisjs/core/http';
import type { MultipartFile } from '@adonisjs/core/bodyparser';

import { ExportImportService } from '#services/user/export_import_service';
import { importFileValidator } from '#validators/user_settings/import_file_validator';
import { importDataValidator } from '#validators/user_settings/import_data_validator';
import InvalidImportFileException from '#exceptions/user_settings/invalid_import_file_exception';

@inject()
export default class ImportUserDataController {
	constructor(protected readonly exportImportService: ExportImportService) {}

	async execute({ auth, request, response }: HttpContext) {
		const user = auth.getUserOrFail();
		const { file } = await request.validateUsing(importFileValidator);

		const importedData = this.parseImportFile(await this.readUpload(file));
		const validatedData = await importDataValidator.validate(importedData);
		await this.exportImportService.importUserData(user.id, validatedData);

		return response.redirect().back();
	}

	/**
	 * A validated upload has been buffered to disk, so a missing path is an
	 * operational fault rather than a bad file — but the person waiting on the
	 * page can only ever act on it as "this upload did not work".
	 */
	private async readUpload(file: MultipartFile): Promise<string> {
		if (!file.tmpPath) {
			throw new InvalidImportFileException('The upload could not be read');
		}

		return readFile(file.tmpPath, 'utf-8');
	}

	private parseImportFile(contents: string): unknown {
		try {
			return JSON.parse(contents);
		} catch {
			throw new InvalidImportFileException(
				'The uploaded file is not valid JSON'
			);
		}
	}
}
