/** Largest value of a Postgres `integer` primary key: anything above it cannot match a row and would make the query fail. */
export const MAXIMUM_DATABASE_ID = 2147483647;

/** Matches the largest import, so reordering or bulk-acting on a library imported at the limit still fits. */
export const MAXIMUM_ID_LIST_LENGTH = 20000;
