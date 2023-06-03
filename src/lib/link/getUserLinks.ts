import { User } from "@prisma/client";
import prisma from "utils/prisma";

export default async function getUserLinks(user: User) {
  return await prisma.link.findMany({
    where: {
      authorId: user.id,
    },
  });
}
