export type CapturedLogLine = Record<string, unknown> & {
	level: number;
	msg?: string;
};

const PINO_LEVEL_DEBUG = 20;

const capturedLines: string[] = [];

/**
 * Receives every line the app logger writes while the suite runs, so a test can
 * assert on what actually reached the log instead of on what a call site meant.
 */
export const capturedLogDestination = {
	write(line: string) {
		capturedLines.push(line);
	},
};

export function clearCapturedLogs(): void {
	capturedLines.length = 0;
}

export function readCapturedLogs(): CapturedLogLine[] {
	return capturedLines.map((line) => JSON.parse(line) as CapturedLogLine);
}

/** What a default `info` production instance would write: debug and trace are filtered out. */
export function readAlwaysOnLogs(): CapturedLogLine[] {
	return readCapturedLogs().filter((line) => line.level > PINO_LEVEL_DEBUG);
}
