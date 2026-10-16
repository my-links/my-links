import { IconButton } from '@minimalstuff/ui';

type RevokeSessionButtonProps = {
	publicId: string;
	onRevoke: (publicId: string) => void;
};

export function RevokeSessionButton({
	publicId,
	onRevoke,
}: Readonly<RevokeSessionButtonProps>) {
	const handleClick = () => onRevoke(publicId);

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
