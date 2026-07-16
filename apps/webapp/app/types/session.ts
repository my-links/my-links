export type SessionData = {
	ip: string | null;
	userAgent: string | null;
	browser: {
		name: string | null;
		version: string | null;
		type: string | null;
	};
	engine: {
		name: string | null;
		version: string | null;
	};
};
