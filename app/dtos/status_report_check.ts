import type { HealthCheckMeta, HealthCheckStatus } from '#shared/types/dto';

export interface StatusReportCheck {
	name: string;
	status: HealthCheckStatus;
	message: string;
	meta?: HealthCheckMeta;
}

export class StatusReportCheckDto {
	declare name: string;
	declare status: HealthCheckStatus;
	declare message: string;
	declare meta: HealthCheckMeta | undefined;

	constructor(check: StatusReportCheck) {
		this.name = check.name;
		this.status = check.status;
		this.message = check.message;
		this.meta = check.meta;
	}

	serialize(): {
		name: string;
		status: HealthCheckStatus;
		message: string;
		meta: HealthCheckMeta | undefined;
	} {
		return {
			name: this.name,
			status: this.status,
			message: this.message,
			meta: this.meta,
		};
	}

	static fromArray<
		T extends StatusReportCheck,
		TDto extends StatusReportCheckDto,
	>(this: new (check: T) => TDto, checks: T[]): TDto[] {
		if (!Array.isArray(checks)) return [];
		return checks.map((check) => new this(check));
	}
}
