/**
 * Name of the manifest keyboard command that opens MyLinks on its search
 * field. Shared by the manifest (see `wxt.config.ts`) and the background
 * listener that answers it.
 */
export const OPEN_SEARCH_COMMAND = 'open-search';

/**
 * How long a pending focus request stays valid.
 *
 * Long enough for a cold side panel to boot and mount its React tree, short
 * enough that a page opened minutes later for unrelated reasons never
 * inherits a forgotten keystroke.
 */
export const SEARCH_FOCUS_REQUEST_TTL_MS = 5_000;
