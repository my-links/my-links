/**
 * The browser suite delivers through a real SMTP relay (mailpit, see
 * `dev.compose.yml`) rather than the `mail.fake()` queue functional tests
 * swap in — reading a link back out means asking mailpit's own HTTP API for
 * what it actually received.
 */
const MAILPIT_BASE_URL = process.env.MAILPIT_URL ?? 'http://localhost:8025';

const POLL_INTERVAL_MS = 250;
const DEFAULT_TIMEOUT_MS = 10_000;

type MailpitMessageSummary = {
	readonly ID: string;
};

export type MailpitMessage = {
	readonly Subject: string;
	readonly HTML: string;
	readonly Text: string;
};

/**
 * `mail.sendLater()` queues delivery for right after the response, not
 * before it — so the message a browser action just triggered may not have
 * reached mailpit yet by the time this is called. Polling is what a real
 * inbox would make a person do too.
 */
export async function waitForMailTo(
	recipientAddress: string,
	{ timeoutMs = DEFAULT_TIMEOUT_MS }: { readonly timeoutMs?: number } = {}
): Promise<MailpitMessage> {
	const deadline = Date.now() + timeoutMs;

	while (Date.now() < deadline) {
		const message = await latestMailTo(recipientAddress);
		if (message) {
			return message;
		}

		await sleep(POLL_INTERVAL_MS);
	}

	throw new Error(
		`No mail arrived in mailpit for ${recipientAddress} within ${timeoutMs}ms`
	);
}

/**
 * Every template under `resources/views/emails` renders its link twice — the
 * button's `href` and a plain-text fallback right after it — so the first
 * match is exactly what a real recipient would click.
 */
export function extractLinkFromMail(
	message: MailpitMessage,
	pathPrefix: string
): string {
	const hrefPattern = new RegExp(
		`href="([^"]*${escapeRegExp(pathPrefix)}[^"]*)"`
	);
	const match = message.HTML.match(hrefPattern);

	if (!match) {
		throw new Error(
			`No link matching "${pathPrefix}" found in mail "${message.Subject}"`
		);
	}

	return match[1];
}

/**
 * Called once per test group rather than per test: mailpit is a container
 * shared by every local run, including manual poking through its UI, and a
 * search scoped to a unique recipient address is not enough on its own to
 * keep a stale inbox from growing without bound.
 */
export async function resetMailpitInbox(): Promise<void> {
	await fetch(new URL('/api/v1/messages', MAILPIT_BASE_URL), {
		method: 'DELETE',
	});
}

async function latestMailTo(
	recipientAddress: string
): Promise<MailpitMessage | null> {
	const searchUrl = new URL('/api/v1/search', MAILPIT_BASE_URL);
	searchUrl.searchParams.set('query', `to:${recipientAddress}`);

	const searchResponse = await fetch(searchUrl);
	const messages = asMessageSummaries(await searchResponse.json());
	const latest = messages[0];

	if (!latest) {
		return null;
	}

	const messageResponse = await fetch(
		new URL(`/api/v1/message/${latest.ID}`, MAILPIT_BASE_URL)
	);

	return asMailpitMessage(await messageResponse.json());
}

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === 'object' && value !== null;
}

/**
 * `fetch().json()` types its result as `unknown`, and mailpit is an external
 * service — the two responses read here are narrowed by hand rather than
 * cast, so a shape mailpit ever stops sending fails loudly instead of
 * producing `undefined` deep inside a test assertion.
 */
function asMessageSummaries(value: unknown): readonly MailpitMessageSummary[] {
	if (!isRecord(value) || !Array.isArray(value.messages)) {
		throw new Error(
			'mailpit search response did not include a "messages" array'
		);
	}

	return value.messages.filter(
		(message): message is MailpitMessageSummary =>
			isRecord(message) && typeof message.ID === 'string'
	);
}

function asMailpitMessage(value: unknown): MailpitMessage {
	if (
		!isRecord(value) ||
		typeof value.Subject !== 'string' ||
		typeof value.HTML !== 'string' ||
		typeof value.Text !== 'string'
	) {
		throw new Error('mailpit message response was missing an expected field');
	}

	return { Subject: value.Subject, HTML: value.HTML, Text: value.Text };
}

function escapeRegExp(value: string): string {
	return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function sleep(durationMs: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, durationMs));
}
