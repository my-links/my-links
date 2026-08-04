type PivotBearingRecord = {
	$extras: Record<string, unknown>;
};

export function readPivotPosition(record: PivotBearingRecord): number {
	const value = record.$extras.pivot_position;
	return typeof value === 'number' ? value : 0;
}
