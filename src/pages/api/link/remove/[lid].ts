import { NextApiRequest, NextApiResponse } from "next";
import prisma from "utils/prisma";

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
        "Une erreur est survenue lors de la suppression du lien (link/remove->findLink)",
    });
  }

  try {
    const link = await prisma.link.delete({
      where: { id: Number(lid) },
    });

    return res.status(200).send({
      success: "Le lien a été supprimé avec succès",
      categoryId: link.categoryId,
    });
  } catch (error) {
    console.error(error);
    return res.status(400).send({
      error:
        "Une erreur est survenue lors de la suppression du lien (link/remove->deleteLink)",
    });
  }
}
