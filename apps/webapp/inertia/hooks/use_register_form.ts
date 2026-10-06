import { useForm } from '@inertiajs/react';
import type { ChangeEvent, FormEvent } from 'react';

import { urlFor } from '~/lib/tuyau';

type RegisterFormData = {
	name: string;
	email: string;
	password: string;
	passwordConfirmation: string;
};

type UseRegisterFormReturn = {
	data: RegisterFormData;
	errors: Partial<Record<keyof RegisterFormData, string>>;
	processing: boolean;
	isSubmitDisabled: boolean;
	handleSubmit: (event: FormEvent<HTMLFormElement>) => void;
	handleChangeOf: (
		field: keyof RegisterFormData
	) => (event: ChangeEvent<HTMLInputElement>) => void;
};

export function useRegisterForm(): UseRegisterFormReturn {
	const { data, setData, submit, processing, errors } =
		useForm<RegisterFormData>({
			name: '',
			email: '',
			password: '',
			passwordConfirmation: '',
		});

	const isSubmitDisabled =
		processing ||
		!data.name ||
		!data.email ||
		!data.password ||
		!data.passwordConfirmation;

	const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		submit('post', urlFor('auth.register.submit'));
	};

	const handleChangeOf =
		(field: keyof RegisterFormData) => (event: ChangeEvent<HTMLInputElement>) =>
			setData(field, event.target.value);

	return {
		data,
		errors,
		processing,
		isSubmitDisabled,
		handleSubmit,
		handleChangeOf,
	};
}
