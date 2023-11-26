import { Category, User } from '@prisma/client';
import prisma from 'utils/prisma';

export default async function getUserCategoryByName(
  user: User,
  name: Category['name'],
) {
  return await prisma.category.findFirst({
    where: { name, authorId: user.id },
  });
}
