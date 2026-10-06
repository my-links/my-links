import { IconButton } from '@minimalstuff/ui';

type RevokeTokenButtonProps = {
	tokenId: number;
	onRevoke: (tokenId: number) => Promise<void>;
};

export function RevokeTokenButton({
	tokenId,
	onRevoke,
}: Readonly<RevokeTokenButtonProps>) {
	const handleClick = () => void onRevoke(tokenId);

	return (
		<IconButton
			icon="i-tabler-trash"
			onClick={handleClick}
			aria-label="Revoke token"
			color="danger"
			size="sm"
		/>
	);
}
