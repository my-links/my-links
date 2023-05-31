import { Session } from "next-auth";
import prisma from "utils/prisma";

export default async function getUserOrThrow(session: Session) {
  return await prisma.user.findFirstOrThrow({
    where: {
      email: session?.user?.email,
    },
  });
}
