import type Link from '#models/link';
import { BaseEvent } from '@adonisjs/core/events';

export default class LinkDeleted extends BaseEvent {
	/**
	 * Accept event data as constructor parameters
	 */
	constructor(public linkId: Link['id']) {
		super();
	}
}
