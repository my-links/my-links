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
  const { name } = await CategoryBodySchema.validate(req.body);

  const category = await getUserCategory(user, cid);
  if (!category) {
    throw new Error('Unable to find category ' + cid);
  }

  const isCategoryNameAlreadyUsed = await getUserCategoryByName(user, name);
  if (isCategoryNameAlreadyUsed) {
    throw new Error('Category name already used');
  }

  if (category.name === name) {
    throw new Error('New category name must be different');
  }

  await prisma.category.update({
    where: { id: cid },
    data: { name },
  });
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
  return res.send({
    success: 'Category successfully deleted',
    categoryId: category.id,
  });
}
