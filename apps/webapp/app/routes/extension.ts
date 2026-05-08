import { controllers } from '#generated/controllers';
import router from '@adonisjs/core/services/router';

router
	.get('/extension/connect', [controllers.extension.Connect, 'prepare'])
	.as('extension.connect');

router
	.post('/extension/connect', [controllers.extension.Connect, 'execute'])
	.as('extension.connect.execute');
