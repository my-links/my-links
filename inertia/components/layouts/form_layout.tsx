import styled from '@emotion/styled';
import { Head, Link } from '@inertiajs/react';
import { route } from '@izzyjs/route/client';
import { FormEvent, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import Button from '~/components/common/form/_button';
import Form from '~/components/common/form/_form';
import TransitionLayout from '~/components/layouts/_transition_layout';
import i18n from '~/i18n';
import { appendCollectionId } from '~/lib/navigation';
import BaseLayout from './_base_layout';

const FormLayoutStyle = styled(TransitionLayout)(({ theme }) => ({
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
	submitBtnDanger?: boolean;
	collectionId?: number;
}

export default function FormLayout({
	title,
	children,

	canSubmit,
	handleSubmit,
	textSubmitButton = i18n.t('common:confirm'),

	disableHomeLink = false,
	submitBtnDanger = false,
	collectionId,
}: FormLayoutProps) {
	const { t } = useTranslation('common');
	return (
		<BaseLayout>
			<FormLayoutStyle>
				<Head title={title} />
				<h2>{title}</h2>
				<Form onSubmit={handleSubmit}>
					{children}
					<Button type="submit" disabled={!canSubmit} danger={submitBtnDanger}>
						{textSubmitButton}
					</Button>
				</Form>
				{!disableHomeLink && (
					<Link href={appendCollectionId(route('dashboard').url, collectionId)}>
						{t('back-home')}
					</Link>
				)}
			</FormLayoutStyle>
		</BaseLayout>
	);
}
