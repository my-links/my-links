import { Session } from 'next-auth';
import prisma from 'utils/prisma';

export default async function getUsers(session: Session) {
  if (!session?.user) {
    return null;
  }
  return await prisma.user.findMany({
    include: {
      _count: {
        select: {
          categories: true,
          links: true,
        },
      },
    },
  });
}
