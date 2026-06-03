import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { prisma } from "@/db/prisma";

type AppAuthUser = {
    role?: string;
    avatar?: string | null;
};

type AppSessionUser = {
    id?: string;
    role?: string;
    avatar?: string | null;
};

export const { handlers, signIn, signOut, auth } = NextAuth({
    providers: [
        Google({
            clientId: process.env.GOOGLE_CLIENT_ID || process.env.AUTH_GOOGLE_ID || "",
            clientSecret:
                process.env.GOOGLE_CLIENT_SECRET || process.env.AUTH_GOOGLE_SECRET || "",
        }),
        Credentials({
            name: "credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                console.log("=== Auth attempt ===");
                console.log("Email:", credentials?.email);

                if (!credentials?.email || !credentials?.password) {
                    console.log("Missing credentials");
                    return null;
                }

                try {
                    const user = await prisma.user.findUnique({
                        where: { email: credentials.email as string },
                    });

                    console.log("User found:", user ? "yes" : "no");

                    if (!user) {
                        console.log("User not found");
                        return null;
                    }

                    const isPasswordValid = await bcrypt.compare(
                        credentials.password as string,
                        user.password
                    );

                    console.log("Password valid:", isPasswordValid);

                    if (!isPasswordValid) {
                        console.log("Invalid password");
                        return null;
                    }

                    console.log("Auth successful!");
                    return {
                        id: user.id,
                        email: user.email,
                        name: user.name || "",
                        role: user.role,
                        avatar: user.avatar || undefined,
                    };
                } catch (error) {
                    console.error("Auth error:", error);
                    return null;
                }
            },
        }),
    ],
    callbacks: {
        async signIn({ user, account }) {
            if (account?.provider !== "google") return true;
            if (!user.email) return false;

            const existingUser = await prisma.user.findUnique({
                where: { email: user.email },
            });

            if (existingUser) {
                await prisma.user.update({
                    where: { id: existingUser.id },
                    data: {
                        name: user.name || existingUser.name,
                        avatar: user.image || existingUser.avatar,
                    },
                });
                return true;
            }

            const password = await bcrypt.hash(
                `${user.email}-${Date.now()}-google-oauth`,
                10
            );

            await prisma.user.create({
                data: {
                    email: user.email,
                    name: user.name || user.email.split("@")[0],
                    password,
                    role: "CONSULTANT",
                    avatar: user.image,
                    title: "Membre DiCe",
                    description:
                        "Compte cree via Google pour acceder aux formations et activites DiCe.",
                },
            });

            return true;
        },
        async jwt({ token, user }) {
            if (user) {
                const appUser = user as typeof user & AppAuthUser;
                const dbUser = token.email
                    ? await prisma.user.findUnique({
                          where: { email: token.email },
                      })
                    : null;

                token.id = dbUser?.id || (user.id as string);
                token.role = dbUser?.role || appUser.role || "CONSULTANT";
                token.avatar = dbUser?.avatar || appUser.avatar || user.image;
            }
            return token;
        },
        async session({ session, token }) {
            if (token && session.user) {
                const sessionUser = session.user as typeof session.user & AppSessionUser;
                sessionUser.id =
                    typeof token.id === "string" ? token.id : sessionUser.id;
                sessionUser.role =
                    typeof token.role === "string" ? token.role : sessionUser.role;
                sessionUser.avatar =
                    typeof token.avatar === "string" ? token.avatar : sessionUser.avatar;
            }
            return session;
        },
    },
    pages: {
        signIn: "/",
        error: "/",
    },
    session: {
        strategy: "jwt",
    },
    debug: true,
});
