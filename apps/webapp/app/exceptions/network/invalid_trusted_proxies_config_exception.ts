import { Exception } from '@adonisjs/core/exceptions';

const STATUS = 500;
const CODE = 'E_INVALID_TRUSTED_PROXIES_CONFIG';

export class InvalidTrustedProxiesConfigException extends Exception {
	static status = STATUS;
	static code = CODE;

	constructor(invalidEntry: string) {
		super(
			`TRUSTED_PROXIES entry "${invalidEntry}" is not a proxy-addr name (loopback, linklocal, uniquelocal), an IP address or a CIDR range`,
			{ status: STATUS, code: CODE }
		);
	}
}
