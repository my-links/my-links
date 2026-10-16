/** A person rarely runs more than a few agents at once; past this the oldest idle one makes room. */
export const MAXIMUM_MCP_SESSIONS_PER_USER = 10;

/** Each session holds a server and transport in memory, so the instance as a whole is capped too. */
export const MAXIMUM_MCP_SESSIONS = 1000;
