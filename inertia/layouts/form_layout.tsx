import { Head, Link } from '@inertiajs/react';
import { t } from '@lingui/core/macro';
import { Trans } from '@lingui/react/macro';
import { Anchor, Button, Container, Group, rem, Title } from '@mantine/core';
import { FormEvent, PropsWithChildren } from 'react';
import { useTuyauRequired } from '~/hooks/use_tuyau_required';
import { BaseLayout } from '~/layouts/base_layout';

export interface FormLayoutProps extends PropsWithChildren {
	title: string;

	canSubmit: boolean;
	handleSubmit: (event: FormEvent<HTMLFormElement>) => void;
	textSubmitButton?: string;

	disableHomeLink?: boolean;
	submitBtnDanger?: boolean;
}

function FormLayout({
	title,
	children,

	canSubmit,
	handleSubmit,
	textSubmitButton = t`Confirm`,

	disableHomeLink = false,
	submitBtnDanger = false,
}: FormLayoutProps) {
	const tuyau = useTuyauRequired();

	return (
		<Container
			data-page-transition
			style={{
				minHeight: '100%',
				display: 'flex',
				flexDirection: 'column',
			}}
			pt={rem(40)}
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
					<Title order={1} size="h2" c="blue">
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
								href={tuyau.$route('dashboard').path}
								disabled={disableHomeLink}
							>
								<Trans>← Back to home</Trans>
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
				</form>
			</main>
		</Container>
	);
}

const LayoutWrapper = (props: FormLayoutProps) => (
	<BaseLayout>
		<FormLayout {...props} />
	</BaseLayout>
);

export { LayoutWrapper as FormLayout };
