import { api } from '#adonis/api';
import { createTuyau } from '@tuyau/client';

export const createTuyauClient = (baseUrl: string) =>
	createTuyau({
		api,
		baseUrl,
	});
