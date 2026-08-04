import app from '@adonisjs/core/services/app';
import { defineConfig } from '@adonisjs/shield';

const shieldConfig = defineConfig({
	/**
	 * Configure CSP policies for your app. Refer documentation
	 * to learn more
	 */
	csp: {
		enabled: true,
		directives: {
			defaultSrc: ["'self'"],
			// The Vite dev server injects its HMR client and React Fast Refresh
			// through inline/eval'd scripts on a different origin — only
			// relaxed outside production, where the built assets are self-hosted
			// and the one inline script (theme bootstrap) carries a nonce.
			scriptSrc: app.inProduction
				? ["'self'", '@nonce']
				: ["'self'", '@nonce', "'unsafe-eval'", "'unsafe-inline'"],
			styleSrc: ["'self'", "'unsafe-inline'"],
			imgSrc: ["'self'", 'data:'],
			fontSrc: ["'self'", 'data:'],
			connectSrc: app.inProduction ? ["'self'"] : ["'self'", 'ws:'],
			objectSrc: ["'none'"],
			baseUri: ["'self'"],
			formAction: ["'self'"],
			frameAncestors: ["'none'"],
		},
		reportOnly: false,
	},

	/**
	 * Configure CSRF protection options. Refer documentation
	 * to learn more
	 */
	csrf: {
		enabled: true,
		exceptRoutes: (ctx) => ctx.request.url().startsWith('/api/'),
		enableXsrfCookie: true,
		methods: ['POST', 'PUT', 'PATCH', 'DELETE'],
	},

	/**
	 * Control how your website should be embedded inside
	 * iFrames
	 */
	xFrame: {
		enabled: true,
		action: 'DENY',
	},

	/**
	 * Force browser to always use HTTPS
	 */
	hsts: {
		enabled: true,
		maxAge: '180 days',
	},

	/**
	 * Disable browsers from sniffing the content type of a
	 * response and always rely on the "content-type" header.
	 */
	contentTypeSniffing: {
		enabled: true,
	},
});

export default shieldConfig;
