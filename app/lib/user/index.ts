import { getDisplayPreferences } from '#shared/lib/display_preferences';
import type { DisplayPreferences } from '#shared/types/index';

export function ensureDisplayPreferences(
	value: Partial<DisplayPreferences> | DisplayPreferences | null | undefined
): DisplayPreferences {
	return getDisplayPreferences(value ?? undefined);
}
