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
			// React Fast Refresh eval's its runtime, so only that relaxation is
			// lifted outside production. Every inline script carries the nonce,
			// which browsers would otherwise ignore in favour of 'unsafe-inline'.
			scriptSrc: app.inProduction
				? ["'self'", '@nonce']
				: ["'self'", '@nonce', "'unsafe-eval'"],
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
