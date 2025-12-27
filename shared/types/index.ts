import { api } from '#adonis/api';

export type ApiRouteName = (typeof api.routes)[number]['name'];

export type CollectionListDisplay = 'list' | 'inline';
export type LinkListDisplay = 'list' | 'grid';
