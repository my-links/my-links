/** Far above any real library, low enough that one import cannot hold a transaction open for minutes. */
export const MAXIMUM_IMPORT_COLLECTIONS = 1000;

/** Counts nested and top-level links together, since both end up as rows in one transaction. */
export const MAXIMUM_IMPORT_LINKS = 20000;

/** Keeps each multi-row insert well under the Postgres bind parameter limit. */
export const IMPORT_INSERT_CHUNK_SIZE = 1000;
