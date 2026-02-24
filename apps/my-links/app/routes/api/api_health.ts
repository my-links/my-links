import router from '@adonisjs/core/services/router';

const HealthController = () =>
	import('#controllers/api/health/health_controller');

router
	.group(() => {
		router.get('', [HealthController, 'render']).as('api-health.index');
	})
	.prefix('/api/v1/health');
