import { usePage } from '@inertiajs/react';

export const LANDING_PAGES = ['favorites', 'inbox'] as const;

export type LandingPage = (typeof LANDING_PAGES)[number];

export const isLandingPage = (value: string): value is LandingPage =>
	LANDING_PAGES.some((landingPage) => landingPage === value);

type LandingPageSettings = {
	defaultLandingPage: LandingPage;
};

export const useLandingPageSettings = (): LandingPageSettings =>
	usePage<LandingPageSettings>().props;
