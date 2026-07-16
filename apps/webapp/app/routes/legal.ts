import router from '@adonisjs/core/services/router';

router.on('/terms').renderInertia('terms', {}).as('terms');
router.on('/privacy').renderInertia('privacy', {}).as('privacy');
