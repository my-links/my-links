import { AUTHOR_GITHUB_URL, AUTHOR_NAME } from '#config/project';
import PATHS from '#core/constants/paths';
import { Anchor, Group, Text } from '@mantine/core';
import ExternalLink from '~/components/common/external_link';
import { ExternalLinkStyled } from '~/components/common/links/external_link_styled';
import { LocaleSwitcher } from '~/components/common/locale_switcher';
import { ThemeSwitcher } from '~/components/common/theme_switcher';
import packageJson from '../../../../package.json';
import classes from './footer.module.css';

export const Footer = () => (
	<Group className={classes.footer}>
		<Group className={classes.footer__content}>
			<Text>
				Made with ❤️ by{' '}
				<ExternalLinkStyled href={AUTHOR_GITHUB_URL}>
					{AUTHOR_NAME}
				</ExternalLinkStyled>
			</Text>
			•
			<Text>
				<Anchor size="sm" component={ExternalLink} href={PATHS.REPO_GITHUB}>
					{packageJson.version}
				</Anchor>
			</Text>
			•
			<Group gap="sm" mt={4} mb={4}>
				<ThemeSwitcher />
				<LocaleSwitcher />
			</Group>
		</Group>
	</Group>
);
