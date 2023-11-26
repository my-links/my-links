import { User } from '@prisma/client';
import prisma from 'utils/prisma';

export default async function getUserCategoriesCount(user: User) {
  return await prisma.category.count({
    where: {
      authorId: user.id,
    },
  });
}
