import { ReactNode } from 'react';
import { MantineContentLayout } from '~/components/layouts/mantine/mantine_content_layout';

import {
	Container,
	SimpleGrid,
	Text,
	ThemeIcon,
	Title,
	rem,
} from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { AiFillFolderOpen } from 'react-icons/ai';
import { FaUser } from 'react-icons/fa';
import { IoIosLink, IoIosSearch, IoIosShareAlt } from 'react-icons/io';
import { IoExtensionPuzzleOutline } from 'react-icons/io5';
import classes from './home.module.css';

const features = [
	'collection',
	'link',
	'search',
	'extension',
	'share',
	'contribute',
] as const;
type FeatureName = (typeof features)[number];

interface FeatureProps {
	name: FeatureName;
}

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

function HomePage() {
	const { t } = useTranslation('about');
	return (
		<Container className={classes.wrapper}>
			<Title className={classes.title}>{t('hero.title')}</Title>

			<Container size={560} p={0}>
				<Text size="sm" className={classes.description}>
					{t('description')}
				</Text>
			</Container>

			<SimpleGrid
				mt={60}
				cols={{ base: 1, sm: 2, md: 3 }}
				spacing={{ base: 'xl', md: 50 }}
				verticalSpacing={{ base: 'xl', md: 50 }}
			>
				{features.map((feature, index) => (
					<Feature name={feature} key={index} />
				))}
			</SimpleGrid>
		</Container>
	);
}

HomePage.layout = (page: ReactNode) => <MantineContentLayout children={page} />;
export default HomePage;
