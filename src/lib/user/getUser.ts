import { Session } from "next-auth";
import prisma from "utils/prisma";

export default async function getUser(session: Session) {
  return await prisma.user.findFirst({
    where: {
      email: session?.user?.email,
    },
  });
}
