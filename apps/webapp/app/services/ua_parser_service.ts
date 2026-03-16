import type { SessionData } from '#types/session';
import { UAParser } from 'ua-parser-js';

export class UaParserService {
	parse(userAgent: string | undefined) {
		if (!userAgent) return null;

		const uaParser = new UAParser();
		uaParser.setUA(userAgent);

		const results = {
			browser: {
				name: uaParser.getBrowser().name ?? null,
				version: uaParser.getBrowser().version ?? null,
				type: uaParser.getBrowser().type ?? 'desktop',
			},
			engine: {
				name: uaParser.getEngine().name ?? null,
				version: uaParser.getEngine().version ?? null,
			},
		} satisfies Pick<SessionData, 'browser' | 'engine'>;

		return results;
	}
}
