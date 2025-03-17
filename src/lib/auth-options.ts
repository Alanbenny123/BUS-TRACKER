import type { AuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { User } from "@/models/User";
import connectDB from "./db";
import GithubProvider from 'next-auth/providers/github';

export const authOptions: AuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    Credentials({
      credentials: {
        email: { label: "Email", type: "email", placeholder: "jsmith@gmail.com" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          await connectDB();
          const user = await User.findOne({ email: credentials.email });

          if (!user) {
            return null;
          }

          const isPasswordMatch = await user.comparePassword(credentials.password);

          if (!isPasswordMatch) {
            return null;
          }

          return {
            id: user._id.toString(),
            email: user.email,
          };
        } catch {
          return null;
        }
      },
    }),
    GithubProvider({
      clientId: process.env.GITHUB_ID as string,
      clientSecret: process.env.GITHUB_SECRET as string,
    }),
  ],
  pages: {
    signIn: '/login',
    error: '/login',
  },
  callbacks: {
    async signIn({ user, account }) {
      try {
        if (account?.provider === 'google') {
          await connectDB();
          
          let dbUser = await User.findOne({ email: user.email });
          
          if (!dbUser) {
            dbUser = await User.create({
              email: user.email,
              name: user.name,
              image: user.image,
            });
          }
        }
        return true;
      } catch (err) {
        console.error('Error in signIn callback:', err);
        return false;
      }
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.accessToken = token.accessToken;
      }
      return session;
    },
    async jwt({ token, account }) {
      if (account) {
        token.accessToken = account.access_token;
      }
      return token;
    },
  },
  debug: true,
  session: {
    strategy: 'jwt',
  },
};
