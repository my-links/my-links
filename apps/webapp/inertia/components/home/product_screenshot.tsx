export function ProductScreenshot() {
	return (
		<div className="rounded-xl border border-rule dark:border-rule-dark overflow-hidden shadow-xl">
			<div className="flex items-center gap-1.5 bg-ink px-4 py-2.5">
				<span className="w-2.5 h-2.5 rounded-full bg-white/20" />
				<span className="w-2.5 h-2.5 rounded-full bg-white/20" />
				<span className="w-2.5 h-2.5 rounded-full bg-white/20" />
			</div>
			<img
				src="/dashboard-screenshot.png"
				alt="MyLinks dashboard with links grouped into collections"
				className="w-full block"
				width={1484}
				height={671}
			/>
		</div>
	);
}
