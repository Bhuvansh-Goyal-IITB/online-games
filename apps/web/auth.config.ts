import GitHub from "next-auth/providers/github";
import { type NextAuthConfig } from "next-auth";

export default {
  providers: [GitHub],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async session({ session, token }) {
      if (token.email && session.user) {
        if (token.name) {
          session.user.name = token.name;
        }
        if (token.id) {
          session.user.id = token.id as string;
        }
        if (token.image) {
          session.user.image = token.image as string;
        }
      }

      return session;
    },
  },
  pages: {
    signIn: "/auth/login",
    error: "/auth/error",
  },
} satisfies NextAuthConfig;
