import { api } from '#adonisjs/api';

export type RouteName = (typeof api)['routes'][number]['name'];
export type RouteParams = (typeof api)['routes'][number]['params'];
