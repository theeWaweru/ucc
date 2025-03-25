// app/api/auth/[...nextauth]/auth.ts
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import dbConnect from "../../../../lib/db/connect";
import mongoose from "mongoose";
import bcrypt from "bcrypt";

// Define a simple schema for the admin user if not already defined elsewhere
const AdminSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: "admin" },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Use the existing model or create a new one
const Admin = mongoose.models.Admin || mongoose.model("Admin", AdminSchema);

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          await dbConnect();

          if (!credentials?.email || !credentials?.password) {
            throw new Error("Email and password are required");
          }

          // Find user by email
          const admin = await Admin.findOne({ email: credentials.email });
          if (!admin) {
            throw new Error("No user found with this email");
          }

          // Verify password
          const isValid = await bcrypt.compare(
            credentials.password,
            admin.password
          );
          if (!isValid) {
            throw new Error("Invalid password");
          }

          // Return user object (exclude password)
          return {
            id: admin._id.toString(),
            name: admin.name,
            email: admin.email,
            role: admin.role,
          };
        } catch (error) {
          console.error("Auth error:", error);
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  // In the callbacks section of auth.ts
  callbacks: {
    async jwt({ token, user }) {
      // Add user role to token when signing in
      if (user) {
        token.role = user.role;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }: { session: any; token: any }) {
      // Add proper type guard
      if (session && session.user) {
        session.user.role = token.role;
        session.user.id = token.id;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/sign-in",
  },
  debug: process.env.NODE_ENV === "development",
};
