import { User } from '@prisma/client';
import { Session } from 'next-auth';
import { useSession } from 'next-auth/react';

type SessionStatus = ReturnType<typeof useSession>['status'];

export default function useUser(): Session & {
  user?: User;
  status: SessionStatus;
} {
  const { data, status } = useSession();
  return { status, ...data, user: data?.user as User };
}
