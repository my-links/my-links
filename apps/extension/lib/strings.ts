/** Trims a nullable text field, collapsing empty/whitespace-only input to
 * `null` — matches how optional description/icon fields are stored. */
export function trimToNullableText(
	value: string | null | undefined
): string | null {
	const trimmed = value?.trim();
	if (!trimmed) {
		return null;
	}
	return trimmed;
}
