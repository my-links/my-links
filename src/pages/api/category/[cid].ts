import { User } from '@prisma/client';
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
  const { name, description, nextId } = await CategoryBodySchema.validate(
    req.body,
  );
  const userId = user.id as User['id'];

  const category = await getUserCategory(user, cid);
  if (!category) {
    throw new Error('Unable to find category ' + cid);
  }

  const isCategoryNameAlreadyUsed = await getUserCategoryByName(user, name);
  if (isCategoryNameAlreadyUsed && isCategoryNameAlreadyUsed?.id !== cid) {
    throw new Error('Category name already used');
  }
  if (category.id === nextId) {
    throw new Error('Category nextId cannot be equal to current category ID');
  }

  if (nextId !== null) {
    const isCategoryIdExist = await prisma.category.findFirst({
      where: {
        authorId: userId,
        id: nextId,
      },
    });
    if (!isCategoryIdExist) {
      throw new Error('Unable to find category ' + nextId);
    }
  }

  if (category.nextId !== nextId) {
    const [previousCategory, prevNextCategory] = await prisma.$transaction([
      prisma.category.findFirst({
        // Current previous category
        where: {
          authorId: userId,
          nextId: category.id,
        },
      }),
      prisma.category.findFirst({
        // New previous category
        where: {
          authorId: userId,
          nextId,
        },
      }),
    ]);

    await prisma.$transaction(
      [
        previousCategory &&
          prisma.category.update({
            where: {
              authorId: userId,
              id: previousCategory.id,
            },
            data: {
              nextId: category.nextId,
            },
          }),
        prisma.category.update({
          where: {
            authorId: userId,
            id: category.id,
          },
          data: {
            name,
            nextId,
          },
        }),
        prevNextCategory &&
          prisma.category.update({
            where: {
              authorId: userId,
              id: prevNextCategory.id,
            },
            data: {
              nextId: category.id,
            },
          }),
      ].filter((a) => a !== null && a !== undefined),
    );
  } else {
    await prisma.category.update({
      where: {
        authorId: userId,
        id: category.id,
      },
      data: {
        name,
        description,
        nextId: category.nextId,
      },
    });
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

  const previousCategory = await prisma.category.findFirst({
    where: { nextId: category.id },
    select: { id: true },
  });

  if (previousCategory) {
    await prisma.category.update({
      where: {
        id: previousCategory?.id,
      },
      data: {
        nextId: category.nextId,
      },
    });
  }

  return res.send({
    success: 'Category successfully deleted',
    categoryId: category.id,
  });
}
