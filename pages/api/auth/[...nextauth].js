import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcrypt';

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export default NextAuth({
    providers: [
        CredentialsProvider({
            name: 'Credentials',
            credentials: {
                username: { label: 'Email', type: 'text', placeholder: 'user@example.com' },
                password: { label: 'Mot de passe', type: 'password', placeholder: '********' }
            },
            async authorize(credentials, req) {
                return { email: 'user@example.com' };
                
                const email = credentials?.email;
                const password = credentials?.password;

                if (!email || !password)
                    return null;

                let user;
                try {
                    user = await prisma.user.findUnique({
                        where: { email }
                    });
                } catch (error) {
                    console.error(`Impossible de récupérer l'utilisateur avec les identifiants : ${credentials}`);
                    return null;
                }

                if (!user)
                    return null;

                const passwordMatch = await bcrypt.compare(password, user.password);
                if (!passwordMatch)
                    return null;

                return {
                    email: user.email
                }
            }
        })
    ]
})
