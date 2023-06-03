import { boolean, number, object, string } from "yup";

import { apiHandler } from "lib/api/handler";
import getUserCategory from "lib/category/getUserCategory";
import getUserLinkByName from "lib/link/getLinkFromCategoryByName";

import { VALID_URL_REGEX } from "constants/url";
import prisma from "utils/prisma";

export default apiHandler({
  post: createLink,
});

const bodySchema = object({
  name: string()
    .trim()
    .required("name is required")
    .max(32, "name is too long"),
  url: string()
    .trim()
    .required("url is required")
    .matches(VALID_URL_REGEX, "invalid url format"),
  categoryId: number().required("categoryId must be a number"),
  favorite: boolean().default(() => false),
}).typeError("Missing request Body");

async function createLink({ req, res, user }) {
  const { name, url, favorite, categoryId } = await bodySchema.validate(
    req.body
  );

  const link = await getUserLinkByName(user, name, categoryId);
  if (link) {
    throw new Error("Link name is already used in this category");
  }

  const category = await getUserCategory(user, categoryId);
  if (!category) {
    throw new Error("Unable to find category " + categoryId);
  }

  await prisma.link.create({
    data: {
      name,
      url,
      categoryId,
      favorite,
      authorId: user.id,
    },
  });

  return res.send({ success: "Link successfully created", categoryId });
}
