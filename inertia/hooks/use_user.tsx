import { usePage } from '@inertiajs/react';
import type { InertiaPage } from '~/types/inertia';

const useUser = () => usePage<InertiaPage>().props.auth;
export default useUser;
