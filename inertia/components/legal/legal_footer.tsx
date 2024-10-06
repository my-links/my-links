import { useTranslation } from 'react-i18next';
import ExternalLink from '~/components/common/external_link';

export default function LegalFooter() {
	const { t } = useTranslation('legal');
	return (
		<>
			<h2>{t('contact.title')}</h2>
			<p>
				{t('contact.description')}{' '}
				<ExternalLink href="mailto:sonnyasdev@gmail.com" target="_blank">
					sonnyasdev[at]gmail[dot]com
				</ExternalLink>
			</p>

			<p>{t('footer.changes')}</p>
			<p css={{ marginBottom: '2em' }}>{t('footer.thanks')}</p>
		</>
	);
}
