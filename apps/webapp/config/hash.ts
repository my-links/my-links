import { defineConfig, drivers } from '@adonisjs/core/hash';

/**
 * argon2id is the only hasher on the instance. There is no legacy hash to
 * migrate, so keeping a second driver around would offer nothing but a weaker
 * fallback nobody asked for.
 */
const hashConfig = defineConfig({
	default: 'argon',

	list: {
		argon: drivers.argon2({
			variant: 'id',
			iterations: 3,
			memory: 65536,
			parallelism: 4,
		}),
	},
});

export default hashConfig;

/**
 * Inferring types for the list of hashers you have configured
 * in your application.
 */
declare module '@adonisjs/core/types' {
	export interface HashersList extends InferHashers<typeof hashConfig> {}
}
