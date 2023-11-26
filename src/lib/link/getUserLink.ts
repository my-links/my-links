import { Link, User } from '@prisma/client';
import prisma from 'utils/prisma';

export default async function getUserLink(user: User, id: Link['id']) {
  return await prisma.link.findFirst({
    where: {
      id,
      authorId: user.id,
    },
    include: {
      category: true,
    },
  });
}
