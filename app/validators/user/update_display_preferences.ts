import {
	COLLECTION_LIST_DISPLAYS,
	DEFAULT_LIST_DISPLAY_PREFERENCES,
	LINK_LIST_DISPLAYS,
} from '#shared/lib/display_preferences';
import vine from '@vinejs/vine';

export const updateDisplayPreferencesValidator = vine.compile(
	vine.object({
		displayPreferences: vine.object({
			linkListDisplay: vine
				.enum(LINK_LIST_DISPLAYS)
				.optional()
				.transform(
					(value) => value ?? DEFAULT_LIST_DISPLAY_PREFERENCES.linkListDisplay
				),
			collectionListDisplay: vine
				.enum(COLLECTION_LIST_DISPLAYS)
				.optional()
				.transform(
					(value) =>
						value ?? DEFAULT_LIST_DISPLAY_PREFERENCES.collectionListDisplay
				),
		}),
	})
);
