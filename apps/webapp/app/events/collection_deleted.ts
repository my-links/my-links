import type Collection from '#models/collection';
import { BaseEvent } from '@adonisjs/core/events';

export default class CollectionDeleted extends BaseEvent {
	/**
	 * Accept event data as constructor parameters
	 */
	constructor(public collectionId: Collection['id']) {
		super();
	}
}
