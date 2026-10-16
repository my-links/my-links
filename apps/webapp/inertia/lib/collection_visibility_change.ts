import type { Data } from '@generated/data';

export const VISIBILITY_CHANGE_CONFIRMATION = {
	NONE: 'none',
	EXPOSURE: 'exposure',
	FOLLOWERS_LOSS: 'followersLoss',
} as const;

export type VisibilityChangeConfirmation =
	(typeof VISIBILITY_CHANGE_CONFIRMATION)[keyof typeof VISIBILITY_CHANGE_CONFIRMATION];

type VisibilityChangeSubject = Pick<
	Data.Collection,
	'visibility' | 'followersCount'
>;

export function getVisibilityChangeConfirmation(
	collection: VisibilityChangeSubject,
	nextVisibility: Data.Collection['visibility']
): VisibilityChangeConfirmation {
	if (collection.visibility === nextVisibility) {
		return VISIBILITY_CHANGE_CONFIRMATION.NONE;
	}
	if (nextVisibility === 'PUBLIC') {
		return VISIBILITY_CHANGE_CONFIRMATION.EXPOSURE;
	}
	if ((collection.followersCount ?? 0) > 0) {
		return VISIBILITY_CHANGE_CONFIRMATION.FOLLOWERS_LOSS;
	}
	return VISIBILITY_CHANGE_CONFIRMATION.NONE;
}
