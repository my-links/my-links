import {
	FloatingIndicator,
	Indicator,
	Tabs as MantineTabs,
	Stack,
} from '@mantine/core';
import { useState } from 'react';
import classes from './floating_tabs.module.css';

export type FloatingTab = {
	value: string;
	label: string;
	content: React.ReactNode;
	disabled?: boolean;
	indicator?: {
		content: string;
		color?: string;
		pulse?: boolean;
		disabled?: boolean;
	};
};

interface FloatingTabsProps {
	tabs: FloatingTab[];
	keepMounted?: boolean;
}

export function FloatingTabs({ tabs, keepMounted = false }: FloatingTabsProps) {
	const [rootRef, setRootRef] = useState<HTMLDivElement | null>(null);
	const [value, setValue] = useState<string | null>(tabs[0].value);
	const [controlsRefs, setControlsRefs] = useState<
		Record<string, HTMLButtonElement | null>
	>({});
	const setControlRef = (val: string) => (node: HTMLButtonElement) => {
		controlsRefs[val] = node;
		setControlsRefs(controlsRefs);
	};

	return (
		<MantineTabs
			variant="none"
			value={value}
			onChange={setValue}
			keepMounted={keepMounted}
		>
			<MantineTabs.List ref={setRootRef} className={classes.list}>
				{tabs.map((tab) => (
					<Indicator
						label={tab.indicator?.content}
						color={tab.indicator?.color}
						processing={tab.indicator?.pulse}
						disabled={!tab.indicator || tab.indicator.disabled}
						size={16}
						key={tab.value}
					>
						<MantineTabs.Tab
							value={tab.value}
							ref={setControlRef(tab.value)}
							className={classes.tab}
							disabled={tab.disabled}
						>
							{tab.label}
						</MantineTabs.Tab>
					</Indicator>
				))}
				<FloatingIndicator
					target={value ? controlsRefs[value] : null}
					parent={rootRef}
					className={classes.indicator}
				/>
			</MantineTabs.List>
			{tabs.map((tab) => (
				<MantineTabs.Panel key={tab.value} value={tab.value}>
					<Stack>{tab.content}</Stack>
				</MantineTabs.Panel>
			))}
		</MantineTabs>
	);
}
