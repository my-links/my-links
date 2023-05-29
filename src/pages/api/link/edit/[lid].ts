import { NextApiRequest, NextApiResponse } from "next";
import prisma from "utils/prisma";

// TODO: Ajouter vérification -> l'utilisateur doit changer au moins un champ
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { lid } = req.query;

  try {
    const link = await prisma.link.findFirst({
      where: { id: Number(lid) },
    });

    if (!link) {
      return res.status(400).send({ error: "Lien introuvable" });
    }
  } catch (error) {
    console.error(error);
    return res.status(400).send({
      error:
        "Une erreur est survenue lors de l'édition du lien (link/edit->findLink)",
    });
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
      .send({ success: "Lien mis à jour avec succès", categoryId });
  } catch (error) {
    console.error(error);
    return res.status(400).send({
      error:
        "Une erreur est survenue lors de l'édition du lien (link/remove->updateLink)",
    });
  }
}
