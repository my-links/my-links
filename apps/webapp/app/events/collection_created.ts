import type Collection from '#models/collection';
import { BaseEvent } from '@adonisjs/core/events';

export default class CollectionCreated extends BaseEvent {
	/**
	 * Accept event data as constructor parameters
	 */
	constructor(public collection: Collection) {
		super();
	}
}
