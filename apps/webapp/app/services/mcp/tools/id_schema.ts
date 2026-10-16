import { z } from 'zod';

import {
	MAXIMUM_DATABASE_ID,
	MAXIMUM_ID_LIST_LENGTH,
} from '#constants/database';

/** The zod twin of `databaseIdSchema`, for MCP tool inputs. */
export const mcpIdSchema = z.number().int().positive().max(MAXIMUM_DATABASE_ID);

export const mcpIdListSchema = z.array(mcpIdSchema).max(MAXIMUM_ID_LIST_LENGTH);
