import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "utils/back";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
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
    const category = await prisma.category.create({
      data: { name },
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
