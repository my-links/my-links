import { api } from '#adonis/api';

export type ApiRouteName = (typeof api.routes)[number]['name'];
