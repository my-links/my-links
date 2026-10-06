export const LANDING_PAGE = {
	FAVORITES: 'favorites',
	INBOX: 'inbox',
} as const;

export type LandingPage = (typeof LANDING_PAGE)[keyof typeof LANDING_PAGE];

export const LANDING_PAGE_ROUTE_NAME = {
	[LANDING_PAGE.FAVORITES]: 'collection.favorites',
	[LANDING_PAGE.INBOX]: 'collection.inbox',
} as const satisfies Record<LandingPage, string>;
