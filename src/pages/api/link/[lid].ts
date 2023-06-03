import { boolean, number, object, string } from "yup";

import { VALID_URL_REGEX } from "constants/url";
import { apiHandler } from "lib/api/handler";
import getUserLink from "lib/link/getUserLink";
import prisma from "utils/prisma";

export default apiHandler({
  put: editLink,
  delete: deleteLink,
});

const querySchema = object({
  lid: number().required(),
});

// FIXME: code duplicated from api/link/create
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

async function editLink({ req, res, user }) {
  const { lid } = await querySchema.validate(req.query);
  const { name, url, favorite, categoryId } = await bodySchema.validate(
    req.body
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
  const { lid } = await querySchema.validate(req.query);

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
