import styled from '@emotion/styled';
import { Link } from '@inertiajs/react';
import { route } from '@izzyjs/route/client';
import { useTranslation } from 'react-i18next';
import Quotes from '~/components/quotes';

const HeroStyle = styled.header(({ theme }) => ({
	height: '250px',
	minHeight: '250px',
	width: '100%',
	backgroundColor: theme.colors.secondary,
	marginTop: '0.5em',
	borderRadius: theme.border.radius,
	padding: '1em',
	display: 'flex',
	gap: '1em',
	alignItems: 'center',
	justifyContent: 'center',
	flexDirection: 'column',

	'& *': {
		textAlign: 'center',
	},
}));

const HeroTitle = styled.h1({
	fontSize: '32px',
});

const HeroQuote = styled(Quotes)({
	fontSize: '20px',
});

const LinkButton = styled(Link)(({ theme }) => ({
	fontSize: '1rem',
	width: 'fit-content',
	color: theme.colors.white,
	backgroundColor: theme.colors.primary,
	borderRadius: '5rem',
	padding: '0.5em 1.5em',
}));

export default function HeroHeader() {
	const { t } = useTranslation();
	return (
		<HeroStyle>
			<HeroTitle>{t('about:hero.title')}</HeroTitle>
			<HeroQuote>{t('common:slogan')}</HeroQuote>
			<LinkButton href={route('dashboard').url}>
				{t('about:hero.cta')}
			</LinkButton>
		</HeroStyle>
	);
}
