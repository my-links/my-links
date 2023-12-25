import { User } from '@prisma/client';
import { Session } from 'next-auth';
import { useSession } from 'next-auth/react';

export default function useUser() {
  const { data } = useSession();
  return data as Session & { user?: User };
}
