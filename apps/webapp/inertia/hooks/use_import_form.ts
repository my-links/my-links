import { router, useForm } from '@inertiajs/react';
import {
	useRef,
	useState,
	type ChangeEvent,
	type FormEvent,
	type RefObject,
} from 'react';

import { urlFor } from '~/lib/tuyau';

type UseImportFormReturn = {
	fileInputRef: RefObject<HTMLInputElement | null>;
	hasFile: boolean;
	processing: boolean;
	importError: string | null;
	importSuccess: boolean;
	handleFileChange: (event: ChangeEvent<HTMLInputElement>) => void;
	handleImport: (event: FormEvent<HTMLFormElement>) => void;
};

export function useImportForm(): UseImportFormReturn {
	const fileInputRef = useRef<HTMLInputElement>(null);
	const [importError, setImportError] = useState<string | null>(null);
	const [importSuccess, setImportSuccess] = useState(false);

	const { data, setData, processing } = useForm<{
		file: File | null;
	}>({
		file: null,
	});

	const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0] ?? null;
		setData('file', file);
		setImportError(null);
		setImportSuccess(false);
	};

	const handleImport = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		setImportError(null);
		setImportSuccess(false);

		if (!data.file) {
			setImportError('Please select a file');
			return;
		}

		const importUrl = urlFor('user.settings.import');
		const formData = new FormData();
		formData.append('file', data.file);

		router.post(importUrl, formData, {
			forceFormData: true,
			onSuccess: () => {
				setImportSuccess(true);
				setData('file', null);
				if (fileInputRef.current) {
					fileInputRef.current.value = '';
				}
				setTimeout(() => {
					router.reload();
				}, 1000);
			},
			onError: (errors: any) => {
				setImportError(
					errors.error ?? errors.file ?? 'An error occurred during import'
				);
			},
		});
	};

	return {
		fileInputRef,
		hasFile: data.file !== null,
		processing,
		importError,
		importSuccess,
		handleFileChange,
		handleImport,
	};
}
