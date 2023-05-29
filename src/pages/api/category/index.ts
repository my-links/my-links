import { NextApiRequest, NextApiResponse } from "next";
import prisma from "utils/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const categories = await prisma.category.findMany();
    console.log("request");
    return res.status(200).send({
      categories,
    });
  } catch (error) {
    console.error(error);
    return res.status(400).send({
      error: "Une erreur est survenue lors de la récupération des catégories",
    });
  }
}
