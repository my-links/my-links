import { DisplayPreferences } from '#shared/types/index';

export const COLLECTION_LIST_DISPLAYS = ['list', 'inline'] as const;
export const LINK_LIST_DISPLAYS = ['list', 'grid'] as const;

export const DEFAULT_LIST_DISPLAY_PREFERENCES: DisplayPreferences = {
	linkListDisplay: LINK_LIST_DISPLAYS[0],
	collectionListDisplay: COLLECTION_LIST_DISPLAYS[0],
} as const;

export function getDisplayPreferences(
	displayPreferences: Partial<DisplayPreferences> = DEFAULT_LIST_DISPLAY_PREFERENCES
): DisplayPreferences {
	return {
		...DEFAULT_LIST_DISPLAY_PREFERENCES,
		...displayPreferences,
	} as const;
}
