import { Category, Visibility } from '@prisma/client';
import prisma from 'utils/prisma';

export default async function getPublicCategoryById(id: Category['id']) {
  return await prisma.category.findFirst({
    where: {
      id,
      visibility: Visibility.public,
    },
    include: {
      links: true,
    },
  });
}
