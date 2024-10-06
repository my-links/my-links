import { ReactNode, useState } from 'react';
import { IconType } from 'react-icons/lib';
import TabItem from '~/components/common/tabs/tab_item';
import TabList from '~/components/common/tabs/tab_list';
import TabPanel from '~/components/common/tabs/tab_panel';
import TransitionLayout from '~/components/layouts/_transition_layout';

export interface Tab {
	title: string;
	content: ReactNode;
	icon?: IconType;
	danger?: boolean;
}

export default function Tabs({ tabs }: { tabs: Tab[] }) {
	const [activeTabIndex, setActiveTabIndex] = useState<number>(0);

	const handleTabClick = (index: number) => {
		setActiveTabIndex(index);
	};

	return (
		<div css={{ width: '100%' }}>
			<TabList>
				{tabs.map(({ title, icon: Icon, danger }, index) => (
					<TabItem
						key={index}
						active={index === activeTabIndex}
						onClick={() => handleTabClick(index)}
						danger={danger ?? false}
					>
						{!!Icon && <Icon size={20} />}
						{title}
					</TabItem>
				))}
			</TabList>
			<TabPanel key={tabs[activeTabIndex].title}>
				<TransitionLayout>{tabs[activeTabIndex].content}</TransitionLayout>
			</TabPanel>
		</div>
	);
}
