export function idSetsMatch(
	currentIds: number[],
	submittedIds: number[]
): boolean {
	if (currentIds.length !== submittedIds.length) {
		return false;
	}
	const current = new Set(currentIds);
	return submittedIds.every((id) => current.has(id));
}
