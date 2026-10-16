import vine from '@vinejs/vine';

import { MAXIMUM_IMPORT_FILE_SIZE } from '#constants/data_import';

/**
 * Guards the upload itself. Declaring the constraints here rather than in the
 * controller is what makes a rejected file a validation error, flashed back to
 * the form by the framework, instead of a crash the user reads as a bug.
 */
export const importFileValidator = vine.create(
	vine.object({
		file: vine.file({
			size: MAXIMUM_IMPORT_FILE_SIZE,
			extnames: ['json'],
		}),
	})
);
