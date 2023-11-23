import { apiHandler } from "lib/api/handler";
import getUserLink from "lib/link/getUserLink";
import { LinkBodySchema, LinkQuerySchema } from "lib/link/linkValidationSchema";
import prisma from "utils/prisma";

export default apiHandler({
  put: editLink,
  delete: deleteLink,
});

async function editLink({ req, res, user }) {
  const { lid } = await LinkQuerySchema.validate(req.query);
  const { name, url, favorite, categoryId } = await LinkBodySchema.validate(
    req.body,
  );

  const link = await getUserLink(user, lid);
  if (!link) {
    throw new Error("Unable to find link " + lid);
  }

  if (
    link.name === name &&
    link.url === url &&
    link.favorite === favorite &&
    link.categoryId === categoryId
  ) {
    throw new Error("You must update at least one field");
  }

  await prisma.link.update({
    where: { id: Number(lid) },
    data: {
      name,
      url,
      favorite,
      categoryId,
    },
  });

  return res
    .status(200)
    .send({ success: "Link successfully updated", categoryId });
}

async function deleteLink({ req, res, user }) {
  const { lid } = await LinkQuerySchema.validate(req.query);

  const link = await getUserLink(user, lid);
  if (!link) {
    throw new Error("Unable to find link " + lid);
  }

  await prisma.link.delete({
    where: { id: Number(lid) },
  });

  return res.send({
    success: "Link successfully deleted",
    categoryId: link.categoryId,
  });
}
