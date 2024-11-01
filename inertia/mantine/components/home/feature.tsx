import { Text, ThemeIcon, rem } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { AiFillFolderOpen } from 'react-icons/ai';
import { FaUser } from 'react-icons/fa';
import { IoIosLink, IoIosSearch, IoIosShareAlt } from 'react-icons/io';
import { IoExtensionPuzzleOutline } from 'react-icons/io5';
import { featureList } from '~/mantine/components/home/feature_list';

type FeatureName = (typeof featureList)[number];

function getIcon(name: FeatureName) {
	switch (name) {
		case 'collection':
			return AiFillFolderOpen;
		case 'link':
			return IoIosLink;
		case 'search':
			return IoIosSearch;
		case 'extension':
			return IoExtensionPuzzleOutline;
		case 'share':
			return IoIosShareAlt;
		case 'contribute':
			return FaUser;
	}
}

interface FeatureProps {
	name: FeatureName;
}

export function Feature({ name: featureName }: FeatureProps) {
	const { t } = useTranslation('about');
	const Icon = getIcon(featureName);
	return (
		<div>
			<ThemeIcon variant="light" size={40} radius={40}>
				<Icon style={{ width: rem(18), height: rem(18) }} />
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
