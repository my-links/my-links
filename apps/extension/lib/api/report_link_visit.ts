import { recordLinkVisit } from '@/lib/api/links';

const MIDDLE_MOUSE_BUTTON = 1;

/**
 * Fire-and-forget: navigation must never wait on the click counter, so
 * a failure is only logged.
 */
export function reportLinkVisit(linkId: number): void {
	recordLinkVisit(linkId).catch((error: unknown) => {
		console.error('MyLinks could not record a link visit', error);
	});
}

export function isMiddleClick(event: { button: number }): boolean {
	return event.button === MIDDLE_MOUSE_BUTTON;
}
