import { api } from '#adonis/api';
import { createTuyau } from '@tuyau/client';

const appUrl = import.meta.env.VITE_APP_URL;

export const tuyauClient = createTuyau({
	api,
	baseUrl: appUrl,
});
