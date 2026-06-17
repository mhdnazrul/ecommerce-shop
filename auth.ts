import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import Google from 'next-auth/providers/google';
import { compare } from 'bcryptjs';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from '@/prisma/client';
import { authConfig } from './auth.config';
import { rateLimit } from '@/lib/rate-limit';
import { logger } from '@/lib/logger';

export const { handlers, auth, signIn, signOut } = NextAuth({
    ...authConfig,
    adapter: PrismaAdapter(prisma),
    session: { strategy: 'jwt', maxAge: 24 * 60 * 60 },
    providers: [
        Google({
            clientId: process.env.AUTH_GOOGLE_ID,
            clientSecret: process.env.AUTH_GOOGLE_SECRET,
        }),
        Credentials({
            name: 'credentials',
            credentials: {
                email: { label: 'Email', type: 'email' },
                password: { label: 'Password', type: 'password' },
            },
            async authorize(credentials, req) {
                // Rate limiting on credentials login
                const ip =
                    req?.headers
                        ?.get('x-forwarded-for')
                        ?.split(',')[0]
                        ?.trim() ||
                    req?.headers?.get('x-real-ip') ||
                    'unknown';
                const { allowed } = rateLimit(`login:${ip}`, {
                    interval: 60_000,
                    maxRequests: 10,
                });
                if (!allowed) return null;

                if (!credentials?.email || !credentials?.password) return null;

                const email = credentials.email as string;
                const password = credentials.password as string;

                const user = await prisma.user.findUnique({
                    where: { email },
                    include: {
                        roles: {
                            include: {
                                role: true,
                            },
                        },
                    },
                });

                if (!user || !user.passwordHash) return null;

                const isValid = await compare(password, user.passwordHash);
                if (!isValid) return null;

                if (!user.isActive) return null;

                // Update last login (non-blocking)
                prisma.user
                    .update({
                        where: { id: user.id },
                        data: { lastLoginAt: new Date() },
                    })
                    .catch((err) => {
                        logger.error(
                            'Failed to update last login',
                            { userId: user.id },
                            err,
                        );
                    });

                return {
                    id: user.id,
                    email: user.email,
                    name:
                        `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() ||
                        user.email,
                    image: user.image,
                    roles: user.roles.map((ur) => ur.role.slug),
                };
            },
        }),
    ],
    callbacks: {
        ...authConfig.callbacks,
        async signIn({ user, account }) {
            if (account?.provider === 'google') {
                const existingUser = await prisma.user.findUnique({
                    where: { email: user.email! },
                    include: { roles: { include: { role: true } } },
                });

                if (existingUser) {
                    // Link account to existing user
                    const roles = existingUser.roles.map((ur) => ur.role.slug);
                    user.roles = roles;
                    return true;
                }

                // New Google user — assign Customer role
                const customerRole = await prisma.role.findUnique({
                    where: { slug: 'customer' },
                });

                if (customerRole && user.id) {
                    await prisma.userRole.create({
                        data: {
                            userId: user.id,
                            roleId: customerRole.id,
                            assignedBy: 'system',
                        },
                    });
                }

                user.roles = ['customer'];
                return true;
            }

            return true;
        },
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id ?? token.id;
                token.roles = user.roles ?? token.roles;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.id;
                session.user.roles = token.roles;
            }
            return session;
        },
    },
});
