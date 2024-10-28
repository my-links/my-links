/// <reference path="../../adonisrc.ts" />

import { api } from '#adonisjs/api';
import { createTuyau } from '@tuyau/client';

export const tuyauAbortController = new AbortController();
export const tuyau = createTuyau({
	api,
	baseUrl: 'http://localhost:3333',
	signal: tuyauAbortController.signal,
});
