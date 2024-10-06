import styled from '@emotion/styled';
import { useTranslation } from 'react-i18next';

const ScreenshotWrapper = styled.div({
	position: 'relative',
	height: '360px',
	width: '640px',
	maxWidth: '100%',
	margin: '0 auto',
});

const Screenshot = styled.img(({ theme }) => ({
	height: 'auto !important',
	width: '100%',
	boxShadow: theme.colors.boxShadow,
	borderRadius: theme.border.radius,
	overflow: 'hidden',
}));

export default function WebsitePreview() {
	const { t } = useTranslation('about');
	return (
		<>
			<h2>{t('look-title')}</h2>
			<ScreenshotWrapper>
				<Screenshot
					src="/website-screenshot.png"
					alt={t('website-screenshot-alt')}
					title={t('website-screenshot-alt')}
				/>
			</ScreenshotWrapper>
		</>
	);
}
