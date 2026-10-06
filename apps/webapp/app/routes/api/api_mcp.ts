import router from '@adonisjs/core/services/router';

import { controllers } from '#generated/controllers';
import { mcpMiddleware } from '#routes/api/api_middleware';

router
	.group(() => {
		router
			.post('', [controllers.api.mcp.HandleMcpRequest, 'execute'])
			.as('api-mcp.handle');
		router
			.get('', [controllers.api.mcp.HandleMcpRequest, 'execute'])
			.as('api-mcp.stream');
		router
			.delete('', [controllers.api.mcp.HandleMcpRequest, 'execute'])
			.as('api-mcp.close');
	})
	.prefix('/api/mcp')
	.middleware(mcpMiddleware);
