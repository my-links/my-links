import { registry } from '@generated/registry';
import { createTuyau } from '@tuyau/core/client';

export const tuyauClient = createTuyau({
	baseUrl: '/',
	registry,
});

export const urlFor = tuyauClient.urlFor;
