import { events } from '#generated/events';
import { toBroadcastable } from '#lib/broadcastable';
import CollectionTransformer from '#transformers/collection';
import LinkTransformer from '#transformers/link';
import emitter from '@adonisjs/core/services/emitter';
import logger from '@adonisjs/core/services/logger';
import transmit from '@adonisjs/transmit/services/main';

emitter.on(events.CollectionCreated, function (event) {
	const collectionId = event.collection.id;
	const userId = event.collection.authorId;

	logger.info(`Collection created: ${collectionId} [${userId}]`);

	transmit.broadcast(
		`collections/${userId}/created`,
		toBroadcastable({
			collection: CollectionTransformer.transform(event.collection),
		})
	);
});

emitter.on(events.CollectionUpdated, function (event) {
	const collectionId = event.collection.id;
	const userId = event.collection.authorId;

	logger.info(`Collection updated: ${collectionId} [${userId}]`);

	transmit.broadcast(
		`collections/${userId}/updated`,
		toBroadcastable({
			collection: CollectionTransformer.transform(event.collection),
		})
	);
});

emitter.on(events.CollectionDeleted, function (event) {
	const collectionId = event.collectionId;

	logger.info(`Collection deleted: ${collectionId}`);

	// transmit.broadcast(
	// 	`links/${userId}/deleted`,
	// 	toBroadcastable({
	// 		collectionId,
	// 	})
	// );
});

emitter.on(events.LinkCreated, function (event) {
	const linkId = event.link.id;
	const userId = event.link.authorId;

	logger.info(`Link created: ${linkId} [${userId}]`);

	transmit.broadcast(
		`links/${userId}/created`,
		toBroadcastable({
			link: LinkTransformer.transform(event.link),
		})
	);
});

emitter.on(events.LinkUpdated, function (event) {
	const linkId = event.link.id;
	const userId = event.link.authorId;

	logger.info(`Link updated: ${linkId} [${userId}]`);

	transmit.broadcast(`links/${userId}/updated`, {
		linkId,
	});
});

emitter.on(events.LinkDeleted, function (event) {
	const linkId = event.linkId;

	logger.info(`Link deleted: ${linkId}`);

	// transmit.broadcast(
	// 	`links/${userId}/deleted`,
	// 	toBroadcastable({
	// 		linkId,
	// 	})
	// );
});
