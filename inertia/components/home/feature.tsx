import { Text, ThemeIcon, rem } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { featureList } from '~/components/home/feature_list';

type FeatureName = (typeof featureList)[number];

function getIconClass(name: FeatureName): string {
	switch (name) {
		case 'collection':
			return 'i-ant-design-folder-open-filled';
		case 'link':
			return 'i-ion-link';
		case 'search':
			return 'i-ion-search';
		case 'extension':
			return 'i-ion-extension-puzzle-outline';
		case 'share':
			return 'i-ion-share-alt';
		case 'contribute':
			return 'i-fa6-solid-user';
	}
}

interface FeatureProps {
	name: FeatureName;
}

export function Feature({ name: featureName }: FeatureProps) {
	const { t } = useTranslation('about');
	const iconClass = getIconClass(featureName);
	return (
		<div>
			<ThemeIcon variant="light" size={40} radius={40}>
				<div
					className={iconClass}
					style={{ width: rem(18), height: rem(18) }}
				/>
			</ThemeIcon>
			<Text mt="sm" mb={7}>
				{t(`${featureName}.title`)}
			</Text>
			<Text size="sm" c="dimmed" lh={1.6}>
				{t(`${featureName}.text`)}
			</Text>
		</div>
	);
}
