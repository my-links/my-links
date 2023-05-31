import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";

import prisma from "utils/prisma";
import { authOptions } from "../auth/[...nextauth]";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions); // je sais plus d'où ça vient
  console.log("session", session);
  if (!session?.user) {
    return res.status(400).send({ error: "You must be connected" });
  }

  const name = req.body?.name as string;
  const url = req.body?.url as string;
  const favorite = Boolean(req.body?.favorite) || false;
  const categoryId = Number(req.body?.categoryId);

  if (!name) {
    return res.status(400).send({ error: "Nom du lien manquant" });
  }

  if (!url) {
    return res.status(400).send({ error: "URL du lien manquant" });
  }

  if (!categoryId) {
    return res.status(400).send({ error: "Catégorie du lien manquante" });
  }

  try {
    const link = await prisma.link.findFirst({
      where: { name, categoryId },
    });

    if (link) {
      return res.status(400).send({
        error: "Un lien avec ce nom existe déjà dans cette catégorie",
      });
    }
  } catch (error) {
    console.error(error);
    return res.status(400).send({
      error:
        "Une erreur est survenue lors de la création du lien (link/create->findLink)",
    });
  }

  try {
    const category = await prisma.category.findFirst({
      where: { id: categoryId },
    });

    if (!category) {
      return res.status(400).send({ error: "Cette catégorie n'existe pas" });
    }
  } catch (error) {
    console.error(error);
    return res.status(400).send({
      error:
        "Une erreur est survenue lors de la création du lien (link/create->findCategory)",
    });
  }

  try {
    const { id: authorId } = await prisma.user.findFirstOrThrow({
      where: { email: session.user.email },
    });
    await prisma.link.create({
      data: {
        name,
        url,
        categoryId,
        favorite,
        authorId,
      },
    });
    return res
      .status(200)
      .send({ success: "Lien créé avec succès", categoryId });
  } catch (error) {
    console.error(error);
    return res.status(400).send({
      error:
        "Une erreur est survenue lors de la création du lien (link/create->createLink)",
    });
  }
}
