import { Exception } from '@adonisjs/core/exceptions';

const STATUS = 409;
const CODE = 'E_LAST_ADMINISTRATOR';

const REFUSED_MESSAGE =
	'This is the only administrator left on this instance — promote another account before demoting it';

/**
 * Raised when demoting an account would leave the instance without a single
 * administrator.
 *
 * Nothing in the interface can hand the role back once it is gone, and a
 * self-hosted instance has no support desk to ask: the way out would be a SQL
 * console. Same shape as the guard standing in front of the last sign-in
 * method of an account, one level up.
 */
export default class LastAdministratorException extends Exception {
	static status = STATUS;
	static code = CODE;

	constructor() {
		super(REFUSED_MESSAGE, { status: STATUS, code: CODE });
	}
}
