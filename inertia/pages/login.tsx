import styled from '@emotion/styled';
import { Head, Link } from '@inertiajs/react';
import { route } from '@izzyjs/route/client';
import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { FcGoogle } from 'react-icons/fc';
import Button from '~/components/common/form/_button';
import ContentLayout from '~/components/layouts/content_layout';
import Quotes from '~/components/quotes';

const LoginContainer = styled.div({
  width: '100%',
  maxWidth: '100%',
  whiteSpace: 'nowrap',
  display: 'flex',
  alignItems: 'center',
  gap: '1.5em',
  flexDirection: 'column',
});

const FormWrapper = styled.div(({ theme }) => ({
  width: '100%',
  backgroundColor: theme.colors.secondary,
  padding: '2em',
  borderRadius: theme.border.radius,
  border: `1px solid ${theme.colors.lightGrey}`,
  display: 'flex',
  gap: '1em',
  flex: 1,
  alignItems: 'center',
  justifyContent: 'center',
  flexDirection: 'column',
}));

const InformativeText = styled.p(({ theme }) => ({
  width: '100%',
  padding: '10px',
  textAlign: 'center',
  color: theme.colors.darkBlue,
  backgroundColor: theme.colors.lightestBlue,
  borderRadius: theme.border.radius,
}));

const AgreementText = styled.p(({ theme }) => ({
  color: theme.colors.grey,
}));

const ButtonLink = styled(Button.withComponent('a'))({
  display: 'flex',
  gap: '0.35em',
  alignItems: 'center',
  justifyContent: 'center',
});

function LoginPage() {
  const { t } = useTranslation();
  return (
    <LoginContainer css={{ width: '500px', marginTop: '50px' }}>
      <Head title={t('login:title')} />
      <img
        src={'/logo-light.png'}
        width={300}
        height={100}
        alt="MyLinks's logo"
      />
      <Quotes css={{ marginBottom: '3em' }}>{t('common:slogan')}</Quotes>
      <FormWrapper>
        <h1>{t('login:title')}</h1>
        <InformativeText>{t('login:informative-text')}</InformativeText>
        <ButtonLink href={route('auth.google').url}>
          <FcGoogle size="1.5em" />{' '}
          {t('login:continue-with', { provider: 'Google' })}
        </ButtonLink>
      </FormWrapper>
      <AgreementText>
        {t('login:accept-terms')}{' '}
        <Link href={route('terms').url}>{t('common:terms')}</Link>
      </AgreementText>
    </LoginContainer>
  );
}

LoginPage.layout = (page: ReactNode) => (
  <ContentLayout
    children={page}
    css={{ display: 'flex', alignItems: 'center' }}
  />
);
export default LoginPage;
