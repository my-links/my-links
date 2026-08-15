import { useEffect, useRef } from 'react';
import { Trans } from '@lingui/react/macro';
import { ConfirmModal } from '@minimalstuff/ui';
// react-joyride pinned to 3.1.0: 3.2.0 causes an infinite render loop on mount with React 19.2.8.
import {
	ACTIONS,
	EVENTS,
	Joyride,
	STATUS,
	type EventData,
	type Step,
} from 'react-joyride';

import { useTourStore } from '~/stores/tour_store';
import { useIsMobile } from '~/hooks/use_is_mobile';
import { TourTooltip } from '~/components/tour/tour_tooltip';
import { useDashboardLayoutStore } from '~/stores/dashboard_layout_store';

const steps: Step[] = [
	{
		target: '[data-tour="header-search"]',
		title: <Trans>Search</Trans>,
		content: <Trans>Jump to any link across every collection.</Trans>,
		placement: 'right',
		// Only this step skips its beacon; a global skipBeacon caused a render loop.
		skipBeacon: true,
	},
	{
		target: '[data-tour="favorites"]',
		title: <Trans>Favorites</Trans>,
		content: (
			<Trans>Links you star show up here, across every collection.</Trans>
		),
		placement: 'right',
	},
	{
		target: '[data-tour="inbox"]',
		title: <Trans>Inbox</Trans>,
		content: (
			<Trans>
				Links saved without picking a collection land here. It's yours by
				default and always stays pinned.
			</Trans>
		),
		placement: 'right',
	},
	{
		target: '[data-tour="collections-list"]',
		title: <Trans>Your collections</Trans>,
		content: (
			<Trans>
				Followed, public and private collections live here. Drag a collection to
				reorder it, or collapse/expand a whole section with the buttons at the
				top.
			</Trans>
		),
		placement: 'right',
	},
	{
		target: '[data-tour="link-layout"]',
		title: <Trans>Link layout</Trans>,
		content: (
			<Trans>
				Switch between list, grid, masonry and compact. You can also drag a link
				to reorder it within its collection.
			</Trans>
		),
		placement: 'bottom',
	},
	{
		target: '[data-tour="create-collection"]',
		title: <Trans>Create a collection</Trans>,
		content: <Trans>Group related links together, public or private.</Trans>,
		placement: 'bottom',
	},
];

export function DashboardTour() {
	const {
		run,
		stepIndex,
		hasCompletedDashboardTour,
		startTour,
		advanceStep,
		stopTour,
	} = useTourStore();
	const isMobile = useIsMobile();
	const sidebarOpen = useDashboardLayoutStore((state) => state.sidebarOpen);
	const hasOfferedTourRef = useRef(false);

	const shouldOfferTour = !isMobile && !hasCompletedDashboardTour && !run;

	useEffect(() => {
		if (hasOfferedTourRef.current || !shouldOfferTour) return;
		hasOfferedTourRef.current = true;

		void ConfirmModal.call({
			title: <Trans>Take a quick tour?</Trans>,
			children: (
				<Trans>
					See where your collections, search and the main actions live. It only
					takes a minute.
				</Trans>
			),
			confirmLabel: <Trans>Start tour</Trans>,
			cancelLabel: <Trans>Skip</Trans>,
		}).then((confirmed) => (confirmed ? startTour() : stopTour()));
	}, [shouldOfferTour, startTour, stopTour]);

	return (
		<>
			<Joyride
				run={!isMobile && sidebarOpen && run}
				stepIndex={stepIndex}
				steps={steps}
				onEvent={(data: EventData) => {
					const { action, index, status, type } = data;

					if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
						stopTour();
						return;
					}

					if (type === EVENTS.STEP_AFTER || type === EVENTS.TARGET_NOT_FOUND) {
						const nextIndex = index + (action === ACTIONS.PREV ? -1 : 1);
						if (nextIndex < 0 || nextIndex >= steps.length) {
							stopTour();
							return;
						}
						advanceStep(nextIndex);
					}
				}}
				continuous
				scrollToFirstStep
				tooltipComponent={TourTooltip}
				options={{ buttons: ['back', 'close', 'skip', 'primary'] }}
			/>
		</>
	);
}
