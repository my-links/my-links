import type Collection from '#models/collection';
import { BaseEvent } from '@adonisjs/core/events';

export default class CollectionUpdated extends BaseEvent {
	/**
	 * Accept event data as constructor parameters
	 */
	constructor(public collection: Collection) {
		super();
	}
}
