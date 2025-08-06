import env from '#start/env';
import edge from 'edge.js';

/**
 * Define a global property
 */
edge.global('nodeEnv', env.get('NODE_ENV'));
