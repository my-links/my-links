import PATHS from "constants/paths";
import NextAuth, { NextAuthOptions, Profile } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import getUserByProfileProvider from "lib/user/getUserByProfileProvider";
import createUser from "lib/user/createUser";
import updateUser from "lib/user/updateUser";
import prisma from "utils/prisma";

const authLogger = (profile: Profile, ...args: any[]) =>
  console.log(
    "[AUTH]",
    profile.email,
    `(${profile.name} - ${profile.sub})`,
    ...args,
  );
const redirectUser = (errorKey: string) => `${PATHS.LOGIN}?error=${errorKey}`;

const checkProvider = (provider: string) => provider === "google";
const checkAccountDataReceived = (profile: Profile) =>
  !!profile?.sub && !!profile?.email;

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
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
    async signIn({ account: accountParam, profile }) {
      if (!checkProvider(accountParam.provider)) {
        authLogger(profile, "rejected : forbidden provider");
        return redirectUser("AUTH_REQUIRED");
      }

      if (!checkAccountDataReceived(profile)) {
        authLogger(profile, "rejected : missing data from provider", profile);
        return redirectUser("MISSING_PROVIDER_VALUES");
      }

      try {
        const isUserExists = await getUserByProfileProvider(profile);
        if (isUserExists) {
          await updateUser(profile);
          authLogger(profile, "success : user updated");
        } else {
          await createUser(profile);
          authLogger(profile, "success : user created");
        }

        return true;
      } catch (error) {
        authLogger(profile, "rejected : unhandled error");
        console.error(error);
        return redirectUser("AUTH_ERROR");
      }
    },
  },
  pages: {
    signIn: PATHS.LOGIN,
    error: PATHS.LOGIN,
    signOut: PATHS.LOGOUT,
  },
} as NextAuthOptions;
export default NextAuth(authOptions);
