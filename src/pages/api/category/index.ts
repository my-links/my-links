import { apiHandler } from "lib/api/handler";
import getUserCategories from "lib/category/getUserCategories";
import getUserCategoryByName from "lib/category/getUserCategoryByName";
import prisma from "utils/prisma";
import { object, string } from "yup";

export default apiHandler({
  get: getCatgories,
  post: createCategory,
});

async function getCatgories({ res, user }) {
  const categories = await getUserCategories(user);
  return res.status(200).send({
    categories,
  });
}

const bodySchema = object({
  name: string()
    .trim()
    .required("name is required")
    .max(32, "name is too long"),
}).typeError("Missing request Body");

async function createCategory({ req, res, user }) {
  const { name } = await bodySchema.validate(req.body);

  const category = await getUserCategoryByName(user, name);
  if (category) {
    throw new Error("Category name already used");
  }

  const categoryCreated = await prisma.category.create({
    data: { name, authorId: user.id },
  });
  return res.status(200).send({
    success: "Category successfully created",
    categoryId: categoryCreated.id,
  });
}