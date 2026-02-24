import { emojiRule } from '#validators/rules/emoji_rule';
import { test } from '@japa/runner';
import vine from '@vinejs/vine';

test.group('Emoji Rule Validation', () => {
	test('should accept valid simple emojis', async ({ assert }) => {
		const schema = vine.create(
			vine.object({
				icon: vine.string().use(emojiRule()),
			})
		);

		const validEmojis = ['😀', '🎉', '❤️', '🔥', '🚀', '⭐', '💯', '🎯'];

		for (const emoji of validEmojis) {
			const result = await schema.validate({ icon: emoji });
			assert.equal(result.icon, emoji);
		}
	});

	test('should reject random strings', async ({ assert }) => {
		const schema = vine.create(
			vine.object({
				icon: vine.string().use(emojiRule()),
			})
		);

		const invalidStrings = [
			'random text',
			'hello world',
			'12345',
			'<script>alert("xss")</script>',
		];

		for (const invalidString of invalidStrings) {
			try {
				await schema.validate({ icon: invalidString });
				assert.fail(`Should reject invalid string: ${invalidString}`);
			} catch (error) {
				assert.isTrue(error instanceof Error);
			}
		}
	});
});
