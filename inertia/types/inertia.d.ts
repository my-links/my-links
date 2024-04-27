import type { User } from './app';

export type InertiaPage<T extends Record<string, unknown> = Record<string, unknown>> = T & {
  auth: {
    user?: User;
    isAuthenticated: boolean;
  };
};
