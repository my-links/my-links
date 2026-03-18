import type Link from '#models/link';
import { BaseEvent } from '@adonisjs/core/events';

export default class LinkCreated extends BaseEvent {
	/**
	 * Accept event data as constructor parameters
	 */
	constructor(public link: Link) {
		super();
	}
}
