import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";

import { authOptions } from "pages/api/auth/[...nextauth]";

export async function getSessionOrThrow(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    throw new Error("You must be connected");
  }

  return session;
}
