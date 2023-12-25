import { User } from '@prisma/client';
import PATHS from 'constants/paths';
import { getServerSideTranslation } from 'i18n';
import getUser from 'lib/user/getUser';
import {
  GetServerSidePropsContext,
  NextApiRequest,
  NextApiResponse,
} from 'next';
import { Session } from 'next-auth';
import { getServerSession } from 'next-auth/next';
import { authOptions } from 'pages/api/auth/[...nextauth]';

export async function getSession(req: NextApiRequest, res: NextApiResponse) {
  return await getServerSession(req, res, authOptions);
}

type AuthenticationContext = GetServerSidePropsContext & {
  session: Session;
  user: User;
};
type AuthenticationReturnType = {
  redirect?: { destination: string };
  props?: Awaited<ReturnType<typeof getServerSideTranslation>> & {
    session: Session;
  };
};

export function withAuthentication(
  serverSidePropsFunc: (
    context: AuthenticationContext,
  ) => Promise<AuthenticationReturnType>,
): (context: GetServerSidePropsContext) => Promise<AuthenticationReturnType> {
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
