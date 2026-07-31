import db from '@adonisjs/lucid/services/db';

/**
 * How many statements the database actually saw while `run` was executing.
 *
 * The knex client emits one `query` event per statement, transaction client
 * included, which is what makes this usable inside the suite's global
 * transaction. It exists for a single kind of assertion: that a listing costs
 * the same whether it returns one row or fifty — the shape of an N+1 is a
 * count that tracks the data, not a count that is high.
 */
export async function countQueries(
	run: () => Promise<unknown>
): Promise<number> {
	const client = db.connection().getReadClient();
	let statements = 0;
	const onQuery = () => {
		statements += 1;
	};

	client.on('query', onQuery);

	try {
		await run();
	} finally {
		client.removeListener('query', onQuery);
	}

	return statements;
}
