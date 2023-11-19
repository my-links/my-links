import prisma from "utils/prisma";
import { Profile } from "next-auth";

export default async function createUser(profile: Profile) {
  return await prisma.user.create({
    data: {
      email: profile.email,
      google_id: profile.sub,
    },
  });
}
