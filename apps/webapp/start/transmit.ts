import transmit from '@adonisjs/transmit/services/main';

type UserPayload = {
	userId: string;
};

const channels = [
	'collections/:userId/created',
	'collections/:userId/updated',
	'collections/:userId/deleted',

	'links/:userId/created',
	'links/:userId/updated',
	'links/:userId/deleted',
] as const;

channels.forEach((channel) => {
	transmit.authorize<UserPayload>(channel, (ctx, { userId }) => {
		const user = ctx.auth.getUserOrFail();
		console.log('authorize', channel, userId, user.id);
		return Number(user.id) === Number(userId);
	});
});
