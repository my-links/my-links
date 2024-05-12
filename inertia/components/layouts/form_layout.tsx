import styled from '@emotion/styled';
import { Link } from '@inertiajs/react';
import { FormEvent, ReactNode } from 'react';
import Button from '~/components/common/form/_button';
import Form from '~/components/common/form/_form';
import BaseLayout from './_base_layout';
import { appendCollectionId } from '~/lib/navigation';
import PATHS from '#constants/paths';

const FormLayoutStyle = styled.div(({ theme }) => ({
  height: 'fit-content',
  width: theme.media.mobile,
  maxWidth: '100%',
  marginTop: '10em',
  paddingInline: '1em',
  display: 'flex',
  gap: '0.75em',
  flexDirection: 'column',
}));

interface FormLayoutProps {
  title: string;
  children: ReactNode;

  canSubmit: boolean;
  handleSubmit: (event: FormEvent<HTMLFormElement>) => void;
  textSubmitButton?: string;

  disableHomeLink?: boolean;
  collectionId?: string;
}

const FormLayout = ({
  title,
  children,
  canSubmit,
  handleSubmit,
  textSubmitButton = 'Confirm',
  disableHomeLink = false,
  collectionId,
}: FormLayoutProps) => (
  <BaseLayout>
    <FormLayoutStyle>
      <h2>{title}</h2>
      <Form onSubmit={handleSubmit}>
        {children}
        <Button type="submit" disabled={!canSubmit}>
          {textSubmitButton}
        </Button>
      </Form>
      {!disableHomeLink && (
        <Link href={appendCollectionId(PATHS.DASHBOARD, collectionId)}>
          ← Back to home
        </Link>
      )}
    </FormLayoutStyle>
  </BaseLayout>
);

export default FormLayout;
