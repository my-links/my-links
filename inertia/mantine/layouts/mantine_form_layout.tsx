import { Head, Link } from '@inertiajs/react';
import { route } from '@izzyjs/route/client';
import { Anchor, Button, Container, Group, rem, Title } from '@mantine/core';
import { FormEvent, PropsWithChildren } from 'react';
import { useTranslation } from 'react-i18next';
import { MantineFooter } from '~/components/footer/mantine_footer';
import i18n from '~/i18n';
import { appendCollectionId } from '~/lib/navigation';
import BaseLayout from '~/mantine/layouts/_mantine_base_layout';

export interface FormLayoutProps extends PropsWithChildren {
	title: string;

	canSubmit: boolean;
	handleSubmit: (event: FormEvent<HTMLFormElement>) => void;
	textSubmitButton?: string;

	disableHomeLink?: boolean;
	submitBtnDanger?: boolean;
	collectionId?: number;
}

function MantineFormLayout({
	title,
	children,

	canSubmit,
	handleSubmit,
	textSubmitButton = i18n.t('common:form.confirm'),

	disableHomeLink = false,
	submitBtnDanger = false,
	collectionId,
}: FormLayoutProps) {
	const { t } = useTranslation('common');
	return (
		<Container
			style={{
				minHeight: '100%',
				display: 'flex',
				flexDirection: 'column',
			}}
			pt={80}
		>
			<main
				style={{
					display: 'flex',
					flex: 1,
					alignItems: 'center',
					flexDirection: 'column',
				}}
			>
				<Head title={title} />
				<form
					onSubmit={handleSubmit}
					style={{
						maxWidth: '100%',
						width: rem(600),
					}}
				>
					<Title order={1} size="h2">
						{title}
					</Title>
					{children}

					<Group
						justify={disableHomeLink ? 'flex-end' : 'space-between'}
						align="center"
						mt="md"
					>
						{!disableHomeLink && (
							<Anchor
								component={Link}
								href={appendCollectionId(route('dashboard').url, collectionId)}
								disabled={disableHomeLink}
							>
								{t('back-home')}
							</Anchor>
						)}
						<Button
							type="submit"
							variant="filled"
							disabled={!canSubmit}
							color={submitBtnDanger ? 'red' : 'blue'}
							style={{ transition: 'background-color 0.15s' }}
						>
							{textSubmitButton}
						</Button>
					</Group>
					<MantineFooter />
				</form>
			</main>
		</Container>
	);
}

const LayoutWrapper = (props: FormLayoutProps) => (
	<BaseLayout>
		<MantineFormLayout {...props} />
	</BaseLayout>
);

export { LayoutWrapper as MantineFormLayout };
