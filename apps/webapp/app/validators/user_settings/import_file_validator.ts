import vine from '@vinejs/vine';

const MAX_IMPORT_FILE_SIZE = '10mb';

/**
 * Guards the upload itself. Declaring the constraints here rather than in the
 * controller is what makes a rejected file a validation error, flashed back to
 * the form by the framework, instead of a crash the user reads as a bug.
 */
export const importFileValidator = vine.create(
	vine.object({
		file: vine.file({
			size: MAX_IMPORT_FILE_SIZE,
			extnames: ['json'],
		}),
	})
);
