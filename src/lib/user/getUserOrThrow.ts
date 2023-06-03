import { Session } from "next-auth";
import prisma from "utils/prisma";

export default async function getUserOrThrow(session: Session) {
  if (!session || session === null) {
    throw new Error("You must be connected");
  }
  return await prisma.user.findFirstOrThrow({
    where: {
      email: session?.user?.email,
    },
  });
}
