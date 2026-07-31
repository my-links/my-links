/**
 * Reads a timestamp that came back from an aggregate rather than from a
 * `@column.dateTime()`.
 *
 * Lucid drops the result of `withAggregate` into `$extras` untouched, so it
 * arrives as whatever the driver produced — a `Date` on pg, a string on the
 * drivers that hand timestamps back as text — and never as a `DateTime`. The
 * narrowing lives here rather than in each transformer, and anything else
 * (including the aggregate the caller forgot to ask for) reads as "no value",
 * which is exactly what an account that never triggered the aggregated event
 * has.
 */
export function toIsoTimestamp(value: unknown): string | null {
	if (value instanceof Date) return value.toISOString();
	if (typeof value === 'string') return value;

	return null;
}
