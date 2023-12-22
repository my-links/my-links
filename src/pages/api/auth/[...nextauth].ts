import PATHS from 'constants/paths';
import createUser from 'lib/user/createUser';
import getUserByUserProvider from 'lib/user/getUserByUserProvider';
import updateUser from 'lib/user/updateUser';
import NextAuth, { NextAuthOptions, User } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import prisma from 'utils/prisma';

const authLogger = (user: User, ...args: any[]) =>
  console.log('[AUTH]', user.email, `(${user.name} - ${user.id})`, ...args);
const redirectUser = (errorKey: string) => `${PATHS.LOGIN}?error=${errorKey}`;

const checkProvider = (provider: string) => provider === 'google';
const checkAccountDataReceived = (user: User) => !!user?.id && !!user?.email;

const cookieOptions = {
  sameSite: 'None',
  path: '/',
  secure: true,
};

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          prompt: 'consent',
          access_type: 'offline',
          response_type: 'code',
        },
      },
    }),
  ],
  callbacks: {
    async session({ session }) {
      // check if stored in session still exist in db
      const user = await prisma.user.findFirst({
        where: { email: session.user.email },
      });
      return user ? session : undefined;
    },
    async signIn({ account: accountParam, user }) {
      if (!checkProvider(accountParam.provider)) {
        authLogger(user, 'rejected : forbidden provider');
        return redirectUser('AUTH_REQUIRED');
      }

      if (!checkAccountDataReceived(user)) {
        authLogger(user, 'rejected : missing data from provider', user);
        return redirectUser('MISSING_PROVIDER_VALUES');
      }

      try {
        const isUserExists = await getUserByUserProvider(user);
        if (isUserExists) {
          await updateUser(user);
          authLogger(user, 'success : user updated');
        } else {
          await createUser(user);
          authLogger(user, 'success : user created');
        }

        return true;
      } catch (error) {
        authLogger(user, 'rejected : unhandled error');
        console.error(error);
        return redirectUser('AUTH_ERROR');
      }
    },
  },
  pages: {
    signIn: PATHS.LOGIN,
    error: PATHS.LOGIN,
    signOut: PATHS.LOGOUT,
  },
  cookies: {
    sessionToken: {
      name: 'next-auth.session-token',
      options: cookieOptions,
    },
    callbackUrl: {
      name: 'next-auth.callback-url',
      options: cookieOptions,
    },
    csrfToken: {
      name: 'next-auth.csrf-token',
      options: cookieOptions,
    },
  },
} as NextAuthOptions;
export default NextAuth(authOptions);
