import { errors } from '@adonisjs/lucid';
import app from '@adonisjs/core/services/app';
import { ExceptionHandler, type HttpContext } from '@adonisjs/core/http';
import type {
	StatusPageRange,
	StatusPageRenderer,
} from '@adonisjs/core/types/http';

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
		if (ctx.request.url()?.startsWith('/api/v1')) {
			return ctx.response.status(this.getStatusCode(error)).json({
				message: 'Bad Request',
				errors: [error],
			});
		}

		if (error instanceof errors.E_ROW_NOT_FOUND) {
			return ctx.response.redirectToNamedRoute('collection.favorites');
		}
		return super.handle(error, ctx);
	}

	/**
	 * Framework exceptions (auth, validation, Lucid row-not-found, our own
	 * domain exceptions) all carry their real HTTP status on `.status`.
	 * Preserving it lets API consumers (the browser extension in particular)
	 * distinguish "unauthenticated" from "validation failed" from "not found"
	 * instead of seeing a flattened 400 for everything.
	 */
	private getStatusCode(error: unknown): number {
		if (this.hasNumericStatus(error)) {
			return error.status;
		}
		return 400;
	}

	private hasNumericStatus(error: unknown): error is { status: number } {
		return (
			typeof error === 'object' &&
			error !== null &&
			'status' in error &&
			typeof error.status === 'number'
		);
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
