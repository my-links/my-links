import router from '@adonisjs/core/services/router';

import { controllers } from '#generated/controllers';
import { mcpMiddleware } from '#routes/api/api_middleware';

router
	.group(() => {
		router.post('', [controllers.api.mcp.Mcp, 'handle']).as('api-mcp.handle');
		router.get('', [controllers.api.mcp.Mcp, 'handle']).as('api-mcp.stream');
		router.delete('', [controllers.api.mcp.Mcp, 'handle']).as('api-mcp.close');
	})
	.prefix('/api/mcp')
	.middleware(mcpMiddleware);
