import { apiHandler } from "lib/api/handler";
import {
  CategorieBodySchema,
  CategorieQuerySchema,
} from "lib/category/categoryValidationSchema";
import getUserCategory from "lib/category/getUserCategory";
import getUserCategoryByName from "lib/category/getUserCategoryByName";

import prisma from "utils/prisma";

export default apiHandler({
  put: editCategory,
  delete: deleteCategory,
});

async function editCategory({ req, res, user }) {
  const { cid } = await CategorieQuerySchema.validate(req.query);
  const { name } = await CategorieBodySchema.validate(req.body);

  const category = await getUserCategory(user, cid);
  if (!category) {
    throw new Error("Unable to find category " + cid);
  }

  const isCategoryNameAlreadyused = await getUserCategoryByName(user, name);
  if (isCategoryNameAlreadyused) {
    throw new Error("Category name already used");
  }

  if (category.name === name) {
    throw new Error("New category name must be different");
  }

  await prisma.category.update({
    where: { id: cid },
    data: { name },
  });
  return res.send({
    success: "Category successfully updated",
    categoryId: category.id,
  });
}

async function deleteCategory({ req, res, user }) {
  const { cid } = await CategorieQuerySchema.validate(req.query);

  const category = await getUserCategory(user, cid);
  if (!category) {
    throw new Error("Unable to find category " + cid);
  }

  if (category.links.length !== 0) {
    throw new Error("You cannot remove category with links");
  }

  await prisma.category.delete({
    where: { id: cid },
  });
  return res.send({
    success: "Category successfully deleted",
    categoryId: category.id,
  });
}
