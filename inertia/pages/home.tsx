import { Trans } from '@lingui/react/macro';
import { Container, Text, Title } from '@mantine/core';
import { FeatureList } from '~/components/home/feature_list';
import classes from './home.module.css';

export default function HomePage() {
	return (
		<Container className={classes.wrapper}>
			<Title className={classes.title}>
				<Trans>Manage your links in the best possible way</Trans>
			</Title>

			<Container size={560} p={0}>
				<Text size="sm" className={classes.description}>
					<Trans>
						An open-source, self-hosted bookmark manager that lets you manage
						your favorite links in an intuitive interface
					</Trans>
				</Text>
			</Container>

			<FeatureList />
		</Container>
	);
}
