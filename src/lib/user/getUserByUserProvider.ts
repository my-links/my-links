import { User } from 'next-auth';
import prisma from 'utils/prisma';

export default async function getUserByUserProvider(user: User) {
  return await prisma.user.findFirst({
    where: {
      google_id: user.id,
      email: user.email,
    },
  });
}
