import type { NextAuthOptions } from "next-auth";
import { UpstashRedisAdapter } from '@next-auth/upstash-redis-adapter'
import { db } from "./db";
import GithubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import { fetchRedisData } from "@/helpers/redis";

function getGoogleCredentials() {
    const clientId = process.env.GOOGLE_CLIENT_ID
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET

    if (!clientId || clientId.length === 0) {
        throw new Error('Missing GOOGLE_CLIENT_ID')
    }

    if (!clientSecret || clientSecret.length === 0) {
        throw new Error('Missing GOOGLE_CLIENT_SECRET')
    }

    return { clientId, clientSecret }
}

function getGithubCredentials() {
    const clientId = process.env.GITHUB_ID
    const clientSecret = process.env.GITHUB_SECRET

    if (!clientId || clientId.length === 0) {
        throw new Error('Missing GITHUB_ID')
    }

    if (!clientSecret || clientSecret.length === 0) {
        throw new Error('Missing GITHUB_SECRET')
    }

    return { clientId, clientSecret }
}
export const authOptions: NextAuthOptions = {
    secret: process.env.NEXTAUTH_SECRET,
    adapter: UpstashRedisAdapter(db),
    session: {
        strategy: 'jwt',
    },
    pages: {
        signIn: '/login',
        error: '/login',
    },
    providers: [
        GithubProvider({
            clientId: getGithubCredentials().clientId,
            clientSecret: getGithubCredentials().clientSecret,
        }),
        GoogleProvider({
            clientId: getGoogleCredentials().clientId,
            clientSecret: getGoogleCredentials().clientSecret,
        })
    ],
    logger: {
        error(code, metadata) {
            console.error(code, metadata);
        },
        warn(code) {
            console.warn(code);
        },
        debug(code, metadata) {
            console.debug(code, metadata);
        },
    },
    callbacks: {
        async jwt({ token, user }) {
            // bypass next-auth cacheing
            const dbUserResutlt = await fetchRedisData('get', `user:${token.id}`) as string | null

            if (!dbUserResutlt) {
                token.id = user!.id
                return token

            }
            const dbUser = JSON.parse(dbUserResutlt)
            return {
                id: dbUser.id,
                name: dbUser.name,
                email: dbUser.email,
                picture: dbUser.image,
            }
        },
        async session({ session, token }) {
            if (token) {
                session.user.id = token.id
                session.user.name = token.name
                session.user.email = token.email
                session.user.image = token.picture
            }

            return session
        },
        redirect() {
            return '/dashboard'
        }

    },
};
