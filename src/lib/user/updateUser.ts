import prisma from "../../utils/prisma";
import { Profile } from "next-auth";

export default async function updateUser(profile: Profile) {
  return await prisma.user.update({
    where: {
      email: profile.email,
      google_id: profile.sub,
    },
    data: {
      email: profile.email,
      google_id: profile.sub,
    },
  });
}
