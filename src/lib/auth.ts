import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

export const { handlers, signIn, signOut, auth } = NextAuth({
  basePath: "/api/auth",
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
    async signIn({ account, user }) {
      console.log("NextAuth signIn callback triggered");
      console.log("Account object:", account);
      console.log("User object:", user);
      
      if (account?.provider === "google" && account.id_token) {
        try {
          console.log("Sending ID token to backend...");
          const baseUrl = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/admin\/?$/, "");
          const res = await fetch(`${baseUrl}/auth/google`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              idToken: account.id_token,
            }),
          });
          const data = await res.json();
          console.log("Backend response:", data);

          if (res.ok && data.token) {
            console.log("Backend auth successful");
            // Set our custom backend token to the account so we can access it in jwt callback
            (account as any).backendToken = data.token;
            (account as any).userRole = data.user.role;
            return true;
          }
          console.log("Backend auth failed:", data);
          return false;
        } catch (error) {
          console.error("Error signing in with Google backend", error);
          return false;
        }
      }
      console.log("Missing Google provider or ID token");
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
