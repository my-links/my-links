import { Exception } from '@adonisjs/core/exceptions';

export type EgressRefusalReason =
	| 'blocked'
	| 'unresolvable'
	| 'unauthorized'
	| 'malformed';

const REASON_STATUS: Record<EgressRefusalReason, number> = {
	blocked: 403,
	unresolvable: 502,
	unauthorized: 407,
	malformed: 400,
};

export class EgressRefusedException extends Exception {
	static code = 'E_EGRESS_REFUSED';

	constructor(readonly reason: EgressRefusalReason) {
		super(`Egress refused: ${reason}`, {
			status: REASON_STATUS[reason],
			code: 'E_EGRESS_REFUSED',
		});
	}
}
