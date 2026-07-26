import { errors } from '@adonisjs/lucid';
import app from '@adonisjs/core/services/app';
import { ExceptionHandler, type HttpContext } from '@adonisjs/core/http';
import type {
	HttpError,
	StatusPageRange,
	StatusPageRenderer,
} from '@adonisjs/core/types/http';

const API_PREFIX = '/api/v1';

export default class HttpExceptionHandler extends ExceptionHandler {
	/**
	 * In debug mode, the exception handler will display verbose errors
	 * with pretty printed stack traces.
	 */
	protected debug = !app.inProduction;

	/**
	 * Status pages are used to display a custom HTML pages for certain error
	 * codes. You might want to enable them in production only, but feel
	 * free to enable them in development as well.
	 */
	protected renderStatusPages = app.inProduction;

	/**
	 * Status pages is a collection of error code range and a callback
	 * to return the HTML contents to send as a response.
	 */
	protected statusPages: Record<StatusPageRange, StatusPageRenderer> = {
		'404': (error, { inertia }) =>
			inertia.render('errors/not_found', { error }),
		'500..599': (error, { inertia }) =>
			inertia.render('errors/server_error', { error }),
	};

	/**
	 * The method is used for handling errors and returning
	 * response to the client
	 */
	async handle(error: unknown, ctx: HttpContext) {
		// A missing row is a dead end for a visitor, who is better off on their
		// collections than on a 404 page — but it is information an API client
		// asked for, so it keeps its status there.
		if (error instanceof errors.E_ROW_NOT_FOUND && !this.isApiRequest(ctx)) {
			return ctx.response.redirectToNamedRoute('collection.favorites');
		}

		return super.handle(error, ctx);
	}

	/**
	 * API clients talk to us with an OpenAPI fetch client that sends no
	 * negotiable `Accept` header, so content negotiation would fall back to
	 * HTML and answer a JSON caller with an error page. The route prefix
	 * decides instead; the rendering itself stays the framework's.
	 */
	override renderError(error: HttpError, ctx: HttpContext) {
		if (this.isApiRequest(ctx)) {
			return this.renderErrorAsJSON(error, ctx);
		}

		return super.renderError(error, ctx);
	}

	override renderValidationError(error: HttpError, ctx: HttpContext) {
		if (this.isApiRequest(ctx)) {
			return this.renderValidationErrorAsJSON(error, ctx);
		}

		return super.renderValidationError(error, ctx);
	}

	private isApiRequest(ctx: HttpContext): boolean {
		return ctx.request.url()?.startsWith(API_PREFIX) ?? false;
	}

	/**
	 * The method is used to report error to the logging service or
	 * the a third party error monitoring service.
	 *
	 * @note You should not attempt to send a response from this method.
	 */
	async report(error: unknown, ctx: HttpContext) {
		return super.report(error, ctx);
	}
}
