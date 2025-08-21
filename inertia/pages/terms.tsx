import { Link } from '@inertiajs/react';
import { route } from '@izzyjs/route/client';
import { Trans, useTranslation } from 'react-i18next';
import SmallContentLayout from '~/layouts/small_content';

function TermsPage() {
	const { t } = useTranslation('terms');
	return (
		<>
			<h1>{t('title')}</h1>
			<p>{t('edited_at', { date: '19/11/2023' })}</p>
			<p>{t('welcome')}</p>

			<h2>{t('accept.title')}</h2>
			<p>{t('accept.description')}</p>

			<h2>{t('use.title')}</h2>
			<h3>{t('use.account.title')}</h3>
			<p>{t('use.account.description')}</p>

			<h3>{t('use.allowed.title')}</h3>
			<p>{t('use.allowed.description')}</p>

			<h3>{t('use.user_content.title')}</h3>
			<p>{t('use.user_content.description')}</p>

			<h2>{t('personal_data.title')}</h2>
			<h3>{t('personal_data.collect.title')}</h3>
			<p>
				<Trans
					i18nKey="personal_data.collect.description"
					components={{ a: <Link href={route('privacy').path} /> }}
				/>
			</p>

			<h3>{t('personal_data.suppress.title')}</h3>
			<p>{t('personal_data.suppress.description')}</p>

			<h2>{t('responsibility_warranty.title')}</h2>
			<h3>{t('responsibility_warranty.responsibility.title')}</h3>
			<p>{t('responsibility_warranty.responsibility.description')}</p>

			<h3>{t('responsibility_warranty.warranty.title')}</h3>
			<p>{t('responsibility_warranty.warranty.description')}</p>

			<h2>{t('terms_changes.title')}</h2>
			<p>{t('terms_changes.description')}</p>

			<h2>{t('cancel.title')}</h2>
			<p>{t('cancel.description')}</p>
		</>
	);
}

TermsPage.layout = (page: React.ReactNode) => (
	<SmallContentLayout>{page}</SmallContentLayout>
);
export default TermsPage;
