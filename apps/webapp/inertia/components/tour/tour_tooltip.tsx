import { t } from '@lingui/core/macro';
import { Trans } from '@lingui/react/macro';
import { Button, IconButton } from '@minimalstuff/ui';
import type { TooltipRenderProps } from 'react-joyride';

export function TourTooltip({
	backProps,
	closeProps,
	index,
	isLastStep,
	primaryProps,
	size,
	skipProps,
	step,
	tooltipProps,
}: Readonly<TooltipRenderProps>) {
	const currentStep = index + 1;

	return (
		<div
			{...tooltipProps}
			className="w-80 rounded-xl border border-rule dark:border-rule-dark bg-paper dark:bg-paper-dark p-4 shadow-lg"
		>
			<div className="flex items-start justify-between gap-2">
				{step.title && (
					<h3 className="font-display text-lg text-ink dark:text-ink-dark">
						{step.title}
					</h3>
				)}
				<IconButton
					{...closeProps}
					icon="i-ant-design-close-outlined"
					size="sm"
					variant="ghost"
					aria-label={t`Close tour`}
				/>
			</div>

			<div className="mt-1 text-sm text-ink/80 dark:text-ink-dark/80">
				{step.content}
			</div>

			<div className="mt-4 flex items-center justify-between gap-2">
				{step.buttons.includes('skip') && !isLastStep ? (
					<Button {...skipProps} variant="ghost" size="sm">
						<Trans>Skip tour</Trans>
					</Button>
				) : (
					<span />
				)}

				<div className="flex items-center gap-2">
					{index > 0 && (
						<Button {...backProps} variant="ghost" size="sm">
							<Trans>Back</Trans>
						</Button>
					)}
					<Button {...primaryProps} color="primary" size="sm">
						{isLastStep ? (
							<Trans>Done</Trans>
						) : (
							<Trans>
								Next ({currentStep}/{size})
							</Trans>
						)}
					</Button>
				</div>
			</div>
		</div>
	);
}
