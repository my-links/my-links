import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export default NextAuth({
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            authorization: {
                params: {
                    prompt: 'consent',
                    access_type: 'offline',
                    response_type: 'code'
                }
            }
        })
    ],
    callbacks: {
        async signIn({ account: accountParam, profile }) { // TODO: Auth
            console.log('Connexion via', accountParam.provider, accountParam.providerAccountId, profile.email, profile.name)
            if (accountParam.provider !== 'google') {
                return '/signin?error=' + encodeURI('Authentitifcation via Google requise');
            }

            const email = profile?.email;
            if (email === '') {
                return '/signin?error=' + encodeURI('Impossible de récupérer l\'email associé à ce compte Google');
            }

            const googleId = profile?.sub;
            if (googleId === '') {
                return '/signin?error=' + encodeURI('Impossible de récupérer l\'identifiant associé à ce compte Google');
            }

            try {
                const account = await prisma.user.findFirst({
                    where: {
                        google_id: googleId,
                        email
                    }
                });

                if (!account) {
                    return '/signin?error=' + encodeURI('Vous n\'êtes pas autorisé à vous connecter avec ce compte Google');
                } else {
                    return true;
                }
            } catch (error) {
                console.error(error);
                return '/signin?error=' + encodeURI('Une erreur est survenue lors de l\'authentification');
            }
        }
    },
    pages: {
        signIn: '/signin',
        error: '/signin'
    },
    session: {
        maxAge: 60 * 60 * 6 // Session de 6 heures
    }
});
