import { Container, Text, Title } from '@mantine/core';
import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { FeatureList } from '~/components/home/feature_list';
import classes from './home.module.css';
import { ContentLayout } from '~/layouts/content_layout';

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

			<FeatureList />
		</Container>
	);
}

HomePage.layout = (page: ReactNode) => <ContentLayout children={page} />;
export default HomePage;
