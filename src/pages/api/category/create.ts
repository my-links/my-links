import { NextApiRequest, NextApiResponse } from "next";

import { checkMethodAllowedOrThrow } from "utils/api";
import prisma from "utils/prisma";
import { getSessionOrThrow } from "utils/session";

export default async function POST(req: NextApiRequest, res: NextApiResponse) {
  await checkMethodAllowedOrThrow(req, ["post"]);
  const session = await getSessionOrThrow(req, res);

  const name = req.body?.name as string;
  if (!name) {
    throw new Error("Categorie name missing");
  }

  const category = await prisma.category.findFirst({
    where: { name },
  });
  if (category) {
    throw new Error("Category name already used");
  }

  const { id: authorId } = await prisma.user.findFirstOrThrow({
    where: {
      email: session.user.email,
    },
    select: {
      id: true,
    },
  });

  const categoryCreated = await prisma.category.create({
    data: { name, authorId },
  });
  console.log("là");
  return res.status(200).send({
    success: "Category successfully created",
    categoryId: categoryCreated.id,
  });
}
