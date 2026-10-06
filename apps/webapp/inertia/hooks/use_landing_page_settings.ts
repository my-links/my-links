import { usePage } from '@inertiajs/react';

export type LandingPage = 'favorites' | 'inbox';

type LandingPageSettings = {
	defaultLandingPage: LandingPage;
};

export const useLandingPageSettings = (): LandingPageSettings =>
	usePage<LandingPageSettings>().props;
