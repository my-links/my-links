import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { MantineContentLayout } from '~/components/layouts/mantine/mantine_content_layout';

function PrivacyPage() {
	const { t } = useTranslation('privacy');
	return (
		<>
			<h1>{t('title')}</h1>
			<p>{t('edited_at', { date: '19/11/2023' })}</p>
			<p>{t('welcome')}</p>

			<h2>{t('collect.title')}</h2>
			<h3>{t('collect.cookie.title')}</h3>
			<p>{t('collect.cookie.description')}</p>

			<h3>{t('collect.user.title')}</h3>
			<p>{t('collect.user.description')}</p>
			<ul>
				{(
					t('collect.user.fields', {
						returnObjects: true,
					}) as Array<string>
				).map((field) => (
					<li key={field}>{field}</li>
				))}
			</ul>

			<h2>{t('data_use.title')}</h2>
			<p>{t('data_use.description')}</p>

			<h2>{t('data_storage.title')}</h2>
			<p>{t('data_storage.description')}</p>

			<h3>{t('data_storage.data_retention.title')}</h3>
			<p>{t('data_storage.data_retention.description')}</p>

			<h2>{t('user_rights.title')}</h2>
			<p>{t('user_rights.description')}</p>

			<h2>{t('gdpr.title')}</h2>
			<p>{t('gdpr.description')}</p>
		</>
	);
}

PrivacyPage.layout = (page: ReactNode) => (
	<MantineContentLayout children={page} />
);
export default PrivacyPage;
