import PATHS from '#constants/paths';
import { Link } from '@inertiajs/react';
import { route } from '@izzyjs/route/client';
import { Anchor, Group, Text } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import ExternalLink from '~/components/common/external_link';
import { MantineLanguageSwitcher } from '~/components/common/mantine_language_switcher';
import { MantineThemeSwitcher } from '~/components/common/mantine_theme_switcher';
import packageJson from '../../../package.json';
import classes from './footer.module.css';

export function MantineFooter() {
	const { t } = useTranslation('common');

	const links = [
		{ link: route('privacy').url, label: t('privacy') },
		{ link: route('terms').url, label: t('terms') },
		{ link: PATHS.EXTENSION, label: 'Extension' },
	];

	const items = links.map((link) => (
		<Anchor
			c="dimmed"
			component={Link}
			key={link.label}
			href={link.link}
			size="sm"
		>
			{link.label}
		</Anchor>
	));

	return (
		<div className={classes.footer}>
			<div className={classes.inner}>
				<Group gap={4} c="dimmed">
					<Text size="sm">{t('footer.made_by')}</Text>{' '}
					<Anchor size="sm" component={ExternalLink} href={PATHS.AUTHOR}>
						Sonny
					</Anchor>
					{' • '}
					<Anchor size="sm" component={ExternalLink} href={PATHS.REPO_GITHUB}>
						{packageJson.version}
					</Anchor>
				</Group>

				<Group gap="sm" mt={4} mb={4}>
					<MantineThemeSwitcher />
					<MantineLanguageSwitcher />
				</Group>

				<Group gap="xs" justify="flex-end" wrap="nowrap">
					{items}
				</Group>
			</div>
		</div>
	);
}