import { Category, User } from "@prisma/client";
import prisma from "utils/prisma";

export default async function getUserCategory(user: User, id: Category["id"]) {
  return await prisma.category.findFirst({
    where: {
      authorId: user?.id,
      id,
    },
    include: {
      links: {
        where: {
          authorId: user?.id,
        },
      },
    },
  });
}
