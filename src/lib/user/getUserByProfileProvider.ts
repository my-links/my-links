import { Profile } from "next-auth";
import prisma from "utils/prisma";

export default async function getUserByProfileProvider(profile: Profile) {
  return await prisma.user.findFirst({
    where: {
      google_id: profile.sub,
      email: profile.email,
    },
  });
}
