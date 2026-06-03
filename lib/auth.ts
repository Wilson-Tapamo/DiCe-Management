import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/db/prisma";

type AppSessionUser = {
    id?: string;
    role?: string;
    avatar?: string | null;
};

export const { handlers, signIn, signOut, auth } = NextAuth({
    providers: [
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
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id as string;
                token.role = "role" in user ? user.role : "CONSULTANT";
                token.avatar = "avatar" in user ? user.avatar : user.image;
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
