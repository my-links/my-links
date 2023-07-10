import { PrismaClient } from "@prisma/client";
import PATHS from "constants/paths";
import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

const prisma = new PrismaClient();

// TODO: refactor auth
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
      await prisma.user.findFirstOrThrow({
        where: { email: session.user.email },
      });
      return session;
    },
    async signIn({ account: accountParam, profile }) {
      console.log(
        "[AUTH]",
        "User",
        profile.name,
        profile.sub,
        "attempt to log in with",
        accountParam.provider
      );
      if (accountParam.provider !== "google") {
        console.log("[AUTH]", "User", profile.name, "rejeced : bad provider");
        return (
          PATHS.LOGIN +
          "?error=" +
          encodeURI("Authentitifcation via Google requise")
        );
      }

      const email = profile?.email;
      if (email === "") {
        console.log("[AUTH]", "User", profile.name, "rejeced : missing email");
        return (
          PATHS.LOGIN +
          "?error=" +
          encodeURI(
            "Impossible de récupérer l'email associé à ce compte Google"
          )
        );
      }
      const googleId = profile?.sub;
      if (googleId === "") {
        console.log(
          "[AUTH]",
          "User",
          profile.name,
          "rejeced : missing google id"
        );
        return (
          PATHS.LOGIN +
          "?error=" +
          encodeURI(
            "Impossible de récupérer l'identifiant associé à ce compte Google"
          )
        );
      }
      try {
        const account = await prisma.user.findFirst({
          where: {
            google_id: googleId,
            email,
          },
        });
        const accountCount = await prisma.user.count();
        if (!account) {
          if (accountCount === 0) {
            await prisma.user.create({
              data: {
                email,
                google_id: googleId,
              },
            });
            return true;
          }

          console.log(
            "[AUTH]",
            "User",
            profile.name,
            "rejeced : not authorized"
          );
          return (
            PATHS.LOGIN +
            "?error=" +
            encodeURI(
              "Vous n'êtes pas autorisé à vous connecter avec ce compte Google"
            )
          );
        } else {
          console.log("[AUTH]", "User", profile.name, "success");
          return true;
        }
      } catch (error) {
        console.log("[AUTH]", "User", profile.name, "unhandled error");
        console.error(error);
        return (
          PATHS.LOGIN +
          "?error=" +
          encodeURI("Une erreur est survenue lors de l'authentification")
        );
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
