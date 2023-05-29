import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";

import prisma from "utils/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions); // je sais plus d'où ça vient
  console.log("session", session);
  const name = req.body?.name as string;

  if (!name) {
    return res.status(400).send({ error: "Nom de catégorie manquant" });
  }

  try {
    const category = await prisma.category.findFirst({
      where: { name },
    });

    if (category) {
      return res
        .status(400)
        .send({ error: "Une catégorie avec ce nom existe déjà" });
    }
  } catch (error) {
    console.error(error);
    return res.status(400).send({
      error:
        "Une erreur est survenue lors de la création de la catégorie (category/create->findCategory)",
    });
  }

  try {
    const { id: authorId } = await prisma.user.findFirst({
      where: {
        email: session.user.email,
      },
      select: {
        id: true,
      },
    });
    if (!authorId) {
      throw new Error("Unable to find user");
    }

    const category = await prisma.category.create({
      data: { name, authorId },
    });
    return res.status(200).send({
      success: "Catégorie créée avec succès",
      categoryId: category.id,
    });
  } catch (error) {
    console.error(error);
    return res.status(400).send({
      error:
        "Une erreur est survenue lors de la création de la catégorie (category/create->createCategory)",
    });
  }
}
