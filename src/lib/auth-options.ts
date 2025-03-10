import type { NextAuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { User } from "@/models/User";
import connectDB from "./db";
import { AuthOptions } from 'next-auth';
import GithubProvider from 'next-auth/providers/github';

export const authOptions: AuthOptions = {
  // Configure one or more authentication providers
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    Credentials({
      // `credentials` is used to generate a form on the sign in page.
      // You can specify which fields should be submitted, by adding keys to the `credentials` object.
      // e.g. domain, username, password, 2FA token, etc.
      // You can pass any HTML attribute to the <input> tag through the object.
      credentials: {
        email: { label: "Email", type: "email", placeholder: "jsmith@gmail.com" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          // Connect to database
          await connectDB();

          // Find user by email
          const user = await User.findOne({ email: credentials.email });

          // If user doesn't exist
          if (!user) {
            return null;
          }

          // Check if password matches
          const isPasswordMatch = await user.comparePassword(credentials.password);

          if (!isPasswordMatch) {
            return null;
          }

          // Return user object without password
          return {
            id: user._id.toString(),
            email: user.email,
          };
        } catch (error) {
          return null;
        }
      },
    }),
    GithubProvider({
      clientId: process.env.GITHUB_ID as string,
      clientSecret: process.env.GITHUB_SECRET as string,
    }),
    // ...add more providers here
  ],
  pages: {
    signIn: '/login',
    error: '/login',
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      try {
        if (account?.provider === 'google') {
          await connectDB();
          
          // Check if user exists
          let dbUser = await User.findOne({ email: user.email });
          
          // If user doesn't exist, create new user
          if (!dbUser) {
            dbUser = await User.create({
              email: user.email,
              name: user.name,
              image: user.image,
            });
          }
          
          return true;
        }
        return true;
      } catch (error) {
        console.error('Error in signIn callback:', error);
        return false;
      }
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).accessToken = token.accessToken;
      }
      return session;
    },
    async jwt({ token, account, profile }) {
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
} as AuthOptions;
