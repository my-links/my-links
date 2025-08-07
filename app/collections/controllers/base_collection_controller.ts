import Collection from '#collections/models/collection';
import { HttpContext } from '@adonisjs/core/http';
import vine from '@vinejs/vine';

export default class BaseCollectionController {
	protected collectionIdValidator = vine.compile(
		vine.object({
			collectionId: vine.number().positive().optional(),
		})
	);

	async validateCollectionId(collectionIdRequired: boolean = true) {
		const ctx = HttpContext.getOrFail();
		const { collectionId } = await ctx.request.validateUsing(
			this.collectionIdValidator
		);
		if (!collectionId && collectionIdRequired) {
			console.log('redirecting to dashboard');
			ctx.response.redirectToNamedRoute('dashboard');
			return null;
		}
		console.log('collectionId', collectionId);
		return collectionId;
	}

	redirectToCollectionId(collectionId: Collection['id']) {
		const ctx = HttpContext.getOrFail();
		return ctx.response.redirectToNamedRoute('dashboard', {
			qs: { collectionId },
		});
	}
}
