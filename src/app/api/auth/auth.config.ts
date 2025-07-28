/* eslint-disable @typescript-eslint/no-unused-vars */
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { PrismaClient } from "@prisma/client";
import { verifyPassword } from "@/lib/auth";

const prisma = new PrismaClient();

// @ts-ignore
export const authConfig = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Invalid credentials");
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email
          }
        });

        if (!user || !user.password) {
          throw new Error("No user found");
        }

        const isValid = await verifyPassword(credentials.password, user.password);

        if (!isValid) {
          throw new Error("Invalid password");
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          elo: user.elo
        };
      }
    })
  ],
  session: {
    strategy: "jwt" as const,
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    async session({ session, token }) {
      if (session?.user) {

        // sub = subject <= gets mapped to id value by default
        session.user = {
          id: token.sub!,
          name: token.name,
          email: token.email,
          elo: token.elo
        };

      }
      return session;
    },
    async jwt({ token, user }) {

      if (user) {
        token.elo = user.elo;
        token.name = user.name;
        token.email = user.email;

        // id field is automatically attached to token.sub
      }

      return token;
    }
  },
  debug: process.env.NODE_ENV === "development",
  secret: process.env.NEXTAUTH_SECRET,
}; 
