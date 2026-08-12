import type { Database } from '@adonisjs/lucid/database';
import type { TransactionClientContract } from '@adonisjs/lucid/types/database';

type ExtraWhere = {
	readonly column: string;
	readonly value: string | number;
};

type ReorderByRankOptions = {
	readonly table: string;
	readonly rankedColumn: string;
	readonly ids: readonly number[];
	readonly extraWhere?: ExtraWhere;
	readonly touchedAt?: Date;
};

/**
 * Rewrites `position` on every row named in `ids`, ranked by their order in
 * that array, in a single statement — this is what the reorder endpoints
 * hand a client-submitted order back to. `touchedAt`, when given, also bumps
 * `updated_at` (skipped where the caller doesn't want the row on the delta
 * feed for a mere reorder).
 */
export async function reorderByRank(
	client: Database | TransactionClientContract,
	{ table, rankedColumn, ids, extraWhere, touchedAt }: ReorderByRankOptions
): Promise<void> {
	const setClause = touchedAt
		? 'position = ordered.rank - 1, updated_at = ?'
		: 'position = ordered.rank - 1';
	const joinCondition = `target.${rankedColumn} = ordered.${rankedColumn}`;
	const whereClause = extraWhere
		? `target.${extraWhere.column} = ? AND ${joinCondition}`
		: joinCondition;

	const bindings: unknown[] = [];
	if (touchedAt) bindings.push(touchedAt);
	bindings.push(ids);
	if (extraWhere) bindings.push(extraWhere.value);

	await client.rawQuery(
		`UPDATE ${table} AS target
		 SET ${setClause}
		 FROM UNNEST(?::int[]) WITH ORDINALITY AS ordered(${rankedColumn}, rank)
		 WHERE ${whereClause}`,
		bindings
	);
}
