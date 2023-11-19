import { Category, Link, User } from "@prisma/client";
import prisma from "utils/prisma";

export default async function getLinkFromCategoryByName(
  user: User,
  name: Link["name"],
  categoryId: Category["id"],
) {
  return await prisma.link.findFirst({
    where: {
      authorId: user.id,
      name,
      categoryId,
    },
    include: {
      category: true,
    },
  });
}
