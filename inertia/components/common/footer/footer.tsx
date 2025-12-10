import { AUTHOR_GITHUB_URL, AUTHOR_NAME } from '#config/project';
import PATHS from '#constants/paths';
import { Anchor, Group, Text } from '@mantine/core';
import { withTranslation, WithTranslation } from 'react-i18next';
import ExternalLink from '~/components/common/external_link';
import { ExternalLinkStyled } from '~/components/common/links/external_link_styled';
import { InternalLink } from '~/components/common/links/internal_link';
import { LocaleSwitcher } from '~/components/common/locale_switcher';
import { ThemeSwitcher } from '~/components/common/theme_switcher';
import { useTuyauRequired } from '~/hooks/use_tuyau_required';
import packageJson from '../../../../package.json';
import classes from './footer.module.css';

export const Footer = withTranslation()(({ t }: WithTranslation) => {
	const tuyau = useTuyauRequired();

	return (
		<Group className={classes.footer}>
			<Group className={classes.footer__content}>
				<Text>
					{t('footer.made_by')}{' '}
					<ExternalLinkStyled href={AUTHOR_GITHUB_URL}>
						{AUTHOR_NAME}
					</ExternalLinkStyled>
				</Text>
				•
				<Group gap="sm">
					<ThemeSwitcher />
					<LocaleSwitcher />
				</Group>
				•
				<Group gap="sm">
					<Anchor size="sm" component={ExternalLink} href={PATHS.REPO_GITHUB}>
						{packageJson.version}
					</Anchor>
					<InternalLink href={tuyau.$route('privacy').path}>
						{t('privacy')}
					</InternalLink>
					<InternalLink href={tuyau.$route('terms').path}>
						{t('terms')}
					</InternalLink>
				</Group>
			</Group>
		</Group>
	);
});
