import { Exception } from '@adonisjs/core/exceptions';

const STATUS = 500;
const CODE = 'E_INVALID_EXTENSION_IDS_CONFIG';

export class InvalidExtensionIdsConfigException extends Exception {
	static status = STATUS;
	static code = CODE;

	constructor(invalidId: string) {
		super(
			`EXTENSION_IDS entry "${invalidId}" is neither a 32 character Chromium extension id (letters a to p) nor a Firefox add-on id`,
			{ status: STATUS, code: CODE }
		);
	}
}
