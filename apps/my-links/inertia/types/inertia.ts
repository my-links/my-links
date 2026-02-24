export type InertiaSuccessDetail = {
	page?: { url?: string };
};

export type InertiaSuccessEvent = CustomEvent<InertiaSuccessDetail>;
