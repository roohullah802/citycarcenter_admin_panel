import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async signIn({ account }) {
      if (account?.provider === "google" && account.id_token) {
        try {
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/google`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              idToken: account.id_token,
            }),
          });
          const data = await res.json();

          if (res.ok && data.token) {
            // Check if the user is admin
            if (data.user.role === "admin") {
              // Set our custom backend token to the account so we can access it in jwt callback
              (account as any).backendToken = data.token;
              (account as any).userRole = data.user.role;
              return true;
            } else {
              // Not an admin
              return false;
            }
          }
          return false;
        } catch (error) {
          console.error("Error signing in with Google backend", error);
          return false;
        }
      }
      return false;
    },
    async jwt({ token, account }) {
      if (account) {
        token.backendToken = (account as any).backendToken;
        token.userRole = (account as any).userRole;
      }
      return token;
    },
    async session({ session, token }) {
      if (session) {
        (session as any).backendToken = token.backendToken;
        (session as any).userRole = token.userRole;
      }
      return session;
    },
  },
  pages: {
    signIn: "/sign-in",
    error: "/access-denied",
  },
});
