import ace from '@adonisjs/core/services/ace';

/**
 * Keeps a command's output in memory for the duration of a group.
 *
 * Ace writes to the terminal in its normal mode, which would bury the test
 * reporter under the output of every command a spec runs. The raw mode stores
 * the same lines instead, which is also what `assertLog` reads.
 */
export function captureConsoleOutput() {
	ace.ui.switchMode('raw');

	return () => ace.ui.switchMode('normal');
}
