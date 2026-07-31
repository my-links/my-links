import { test } from '@japa/runner';

test.group('CI sabotage', () => {
	test('deliberately fails to verify the CI gate', ({ assert }) => {
		assert.isTrue(false);
	});
});
