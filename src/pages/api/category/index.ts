import { apiHandler } from 'lib/api/handler';
import { CategoryBodySchema } from 'lib/category/categoryValidationSchema';
import getUserCategories from 'lib/category/getUserCategories';
import getUserCategoryByName from 'lib/category/getUserCategoryByName';

import prisma from 'utils/prisma';

export default apiHandler({
  get: getCategories,
  post: createCategory,
});

async function getCategories({ res, user }) {
  const categories = await getUserCategories(user);
  return res.status(200).send({
    categories,
  });
}

async function createCategory({ req, res, user }) {
  const { name, description } = await CategoryBodySchema.validate(req.body);

  const category = await getUserCategoryByName(user, name);
  if (category) {
    throw new Error('Category name already used');
  }

  const lastCategory = await prisma.category.findFirst({
    where: {
      authorId: user.id,
      nextId: null,
    },
    select: {
      id: true,
    },
  });

  const categoryCreated = await prisma.category.create({
    data: { name, description, authorId: user.id },
  });

  if (lastCategory) {
    await prisma.category.update({
      where: {
        id: lastCategory.id,
      },
      data: {
        nextId: categoryCreated.id,
      },
    });
  }

  return res.status(200).send({
    success: 'Category successfully created',
    categoryId: categoryCreated.id,
  });
}
