import { apiHandler } from 'lib/api/handler';
import {
  CategoryBodySchema,
  CategoryQuerySchema,
} from 'lib/category/categoryValidationSchema';
import getUserCategory from 'lib/category/getUserCategory';
import getUserCategoryByName from 'lib/category/getUserCategoryByName';

import prisma from 'utils/prisma';

export default apiHandler({
  put: editCategory,
  delete: deleteCategory,
});

async function editCategory({ req, res, user }) {
  const { cid } = await CategoryQuerySchema.validate(req.query);
  const { name, nextId } = await CategoryBodySchema.validate(req.body);

  const category = await getUserCategory(user, cid);
  if (!category) {
    throw new Error('Unable to find category ' + cid);
  }

  const isCategoryNameAlreadyUsed = await getUserCategoryByName(user, name);
  if (isCategoryNameAlreadyUsed.id !== cid) {
    throw new Error('Category name already used');
  }

  const authorId = category.authorId;
  if (category.nextId !== nextId) {
    const [previousCategory, prevNextCategory] = await prisma.$transaction([
      prisma.category.findFirst({
        where: {
          authorId,
          nextId: category.id,
        },
      }),
      prisma.category.findFirst({
        where: {
          authorId,
          nextId,
        },
      }),
    ]);

    await prisma.$transaction([
      prisma.category.update({
        where: {
          authorId,
          id: previousCategory.id,
        },
        data: {
          nextId: category.nextId,
        },
      }),
      prisma.category.update({
        where: {
          authorId,
          id: category.id,
        },
        data: {
          nextId,
        },
      }),
      prisma.category.update({
        where: {
          authorId,
          id: prevNextCategory.id,
        },
        data: {
          nextId: category.id,
        },
      }),
    ]);
  }

  return res.send({
    success: 'Category successfully updated',
    categoryId: category.id,
  });
}

async function deleteCategory({ req, res, user }) {
  const { cid } = await CategoryQuerySchema.validate(req.query);

  const category = await getUserCategory(user, cid);
  if (!category) {
    throw new Error('Unable to find category ' + cid);
  }

  if (category.links.length !== 0) {
    throw new Error('You cannot remove category with links');
  }

  await prisma.category.delete({
    where: { id: cid },
  });

  const { id: previousCategoryId } = await prisma.category.findFirst({
    where: { nextId: category.id },
    select: { id: true },
  });
  await prisma.category.update({
    where: {
      id: previousCategoryId,
    },
    data: {
      nextId: category.nextId,
    },
  });
  return res.send({
    success: 'Category successfully deleted',
    categoryId: category.id,
  });
}
