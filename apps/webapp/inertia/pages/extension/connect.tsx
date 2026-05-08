type Props = {
	csrfToken: string;
};

export default function ExtensionConnect({ csrfToken }: Props) {
	return (
		<main className="mx-auto max-w-md px-4 py-12">
			<h1 className="mb-2 text-2xl font-semibold">Browser extension</h1>
			<p className="mb-6 text-gray-600 dark:text-gray-400">
				Authorize the MyLinks extension to access your account through the API.
			</p>
			<form method="post" action="/extension/connect">
				<input type="hidden" name="_csrf" value={csrfToken} />
				<button
					type="submit"
					className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
				>
					Authorize extension
				</button>
			</form>
		</main>
	);
}
