import PATHS from '#constants/paths';
import styled from '@emotion/styled';
import { Link } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import ExternalLink from '~/components/common/external_link';
import { getPath } from '~/lib/navigation';
import packageJson from '../../../package.json';

const FooterStyle = styled.footer(({ theme }) => ({
	fontSize: '0.9em',
	color: theme.colors.grey,
	textAlign: 'center',
	paddingBlock: '0.75em',
	'& a:hover': {
		textDecoration: 'underline',
	},
}));

export default function Footer({ className }: { className?: string }) {
	const { t } = useTranslation('common');

	return (
		<FooterStyle className={className}>
			<div className="row">
				<Link href={getPath('privacy')}>{t('privacy')}</Link>
				{' • '}
				<Link href={getPath('terms')}>{t('terms')}</Link>
				{' • '}
				<ExternalLink href={PATHS.EXTENSION}>Extension</ExternalLink>
			</div>
			<div className="row">
				{t('footer.made_by')}{' '}
				<ExternalLink href={PATHS.AUTHOR}>Sonny</ExternalLink>
				{' • '}
				<span>
					Version:{' '}
					<ExternalLink href={PATHS.REPO_GITHUB}>
						{packageJson.version}
					</ExternalLink>
				</span>
			</div>
		</FooterStyle>
	);
}
