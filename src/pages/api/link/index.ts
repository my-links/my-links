import { apiHandler } from "lib/api/handler";
import getUserCategory from "lib/category/getUserCategory";
import getUserLinkByName from "lib/link/getLinkFromCategoryByName";
import { LinkBodySchema } from "lib/link/linkValidationSchema";

import prisma from "utils/prisma";

export default apiHandler({
  post: createLink,
});

async function createLink({ req, res, user }) {
  const { name, url, favorite, categoryId } = await LinkBodySchema.validate(
    req.body,
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
