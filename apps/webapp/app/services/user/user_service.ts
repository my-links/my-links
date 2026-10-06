import { inject } from '@adonisjs/core';

import User from '#models/user';
import { AUDIT_SUBJECT_TYPE } from '#constants/audit';
import type { RequestOrigin } from '#lib/request_origin';
import { ACTIVITY_EVENT_TYPE } from '#constants/activity';
import type { LandingPage } from '#enums/dashboard/landing_page';
import { ActivityEventService } from '#services/activity/activity_event_service';

@inject()
export class UserService {
	constructor(protected readonly activityEventService: ActivityEventService) {}

	/**
	 * Renaming writes `nickName`, not `name`: `fullname` reads `nickName`
	 * first, so this is the field that actually changes what the account is
	 * called everywhere it is shown.
	 */
	async renameAccount(
		userId: User['id'],
		nickName: string,
		origin: RequestOrigin
	): Promise<void> {
		const user = await User.findOrFail(userId);
		user.nickName = nickName;
		await user.save();

		await this.activityEventService.record({
			type: ACTIVITY_EVENT_TYPE.ACCOUNT_RENAMED,
			userId,
			origin,
			subjectType: AUDIT_SUBJECT_TYPE.ACCOUNT,
			subjectId: userId,
		});
	}

	async updateDefaultLandingPage(
		userId: User['id'],
		defaultLandingPage: LandingPage
	): Promise<void> {
		const user = await User.findOrFail(userId);
		user.defaultLandingPage = defaultLandingPage;
		await user.save();
	}
}
