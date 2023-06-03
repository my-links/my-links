import { number, object, string } from "yup";

import { apiHandler } from "lib/api/handler";
import getUserCategory from "lib/category/getUserCategory";
import prisma from "utils/prisma";
import getUserCategoryByName from "lib/category/getUserCategoryByName";

export default apiHandler({
  put: editCategory,
  delete: deleteCategory,
});

const querySchema = object({
  cid: number().required(),
});

const bodySchema = object({
  name: string()
    .trim()
    .required("name is required")
    .max(32, "name is too long"),
}).typeError("Missing request Body");

async function editCategory({ req, res, user }) {
  const { cid } = await querySchema.validate(req.query);
  const { name } = await bodySchema.validate(req.body);

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
  const { cid } = await querySchema.validate(req.query);

  const category = await getUserCategory(user, cid);
  if (!category) {
    throw new Error("Unable to find category " + cid);
  }

  await prisma.category.delete({
    where: { id: cid },
  });
  return res.send({
    success: "Category successfully deleted",
    categoryId: category.id,
  });
}
