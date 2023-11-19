import {
  GetServerSidePropsContext,
  NextApiRequest,
  NextApiResponse,
} from "next";
import { getServerSession } from "next-auth/next";

import PATHS from "constants/paths";
import getUser from "lib/user/getUser";
import { authOptions } from "pages/api/auth/[...nextauth]";

export async function getSession(req: NextApiRequest, res: NextApiResponse) {
  return await getServerSession(req, res, authOptions);
}

export function withAuthentication(serverSidePropsFunc) {
  return async (context: GetServerSidePropsContext) => {
    const { req, res } = context;

    const session = await getSession(
      req as NextApiRequest,
      res as NextApiResponse,
    );
    const user = await getUser(session);
    if (!session || !user) {
      return {
        redirect: {
          destination: PATHS.LOGIN,
        },
      };
    }

    // Continue on to call `getServerSideProps` logic
    return await serverSidePropsFunc({ ...context, session, user });
  };
}
