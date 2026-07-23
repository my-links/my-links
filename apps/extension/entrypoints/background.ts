export default defineBackground(() => {
	// Firefox has no `sidePanel` API yet (it uses `sidebar_action` instead) —
	// this is a no-op there until Firefox parity lands.
	browser.sidePanel
		?.setPanelBehavior({ openPanelOnActionClick: true })
		.catch((error: unknown) => {
			console.error('Failed to set side panel behavior', error);
		});
});
