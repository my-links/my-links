import { NaContent } from '~/components/common/na_content';

type UserIdentityProps = {
	readonly fullname: string | null;
	readonly avatarUrl?: string | null;
};

/**
 * A row whose account has since been deleted has no `fullname` left to show —
 * that case renders as `NaContent`, not an empty avatar.
 */
export const UserIdentity = ({ fullname, avatarUrl }: UserIdentityProps) => {
	if (!fullname) return <NaContent />;

	return (
		<div className="flex items-center gap-3">
			{avatarUrl ? (
				<img
					src={avatarUrl}
					alt={fullname}
					className="w-8 h-8 rounded-full object-cover shrink-0"
				/>
			) : (
				<div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-xs font-semibold shrink-0">
					{fullname.charAt(0).toUpperCase()}
				</div>
			)}
			<span>{fullname}</span>
		</div>
	);
};
