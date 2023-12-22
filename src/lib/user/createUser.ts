import { User } from 'next-auth';
import prisma from 'utils/prisma';

export default async function createUser(user: User) {
  return await prisma.user.create({
    data: {
      email: user.email,
      google_id: user.id,
      name: user.name,
      image: user.image,
    },
  });
}
