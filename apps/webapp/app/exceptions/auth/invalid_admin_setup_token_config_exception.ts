import { Exception } from '@adonisjs/core/exceptions';

const STATUS = 500;
const CODE = 'E_INVALID_ADMIN_SETUP_TOKEN_CONFIG';

export class InvalidAdminSetupTokenConfigException extends Exception {
	static status = STATUS;
	static code = CODE;

	constructor(minimumLength: number) {
		super(
			`ADMIN_SETUP_TOKEN must be at least ${minimumLength} characters long`,
			{ status: STATUS, code: CODE }
		);
	}
}
