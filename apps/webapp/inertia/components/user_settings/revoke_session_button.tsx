import { IconButton } from '@minimalstuff/ui';

type RevokeSessionButtonProps = {
	sessionId: string;
	onRevoke: (sessionId: string) => void;
};

export function RevokeSessionButton({
	sessionId,
	onRevoke,
}: Readonly<RevokeSessionButtonProps>) {
	const handleClick = () => onRevoke(sessionId);

	return (
		<IconButton
			icon="i-tabler-logout-2"
			onClick={handleClick}
			aria-label="Sign out session"
			color="danger"
			size="sm"
		/>
	);
}
