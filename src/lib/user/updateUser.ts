import { User } from 'next-auth';
import prisma from '../../utils/prisma';

export default async function updateUser(user: User) {
  return await prisma.user.update({
    where: {
      email: user.email,
      google_id: user.id,
    },
    data: {
      email: user.email,
      google_id: user.id,
      name: user.name,
      image: user.image,
    },
  });
}
