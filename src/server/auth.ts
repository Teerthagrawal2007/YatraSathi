import NextAuth, { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      id: "mobile-otp",
      name: "Mobile OTP (India)",
      credentials: {
        phone: { label: "Mobile Number (+91)", type: "text", placeholder: "9876543210" },
        otp: { label: "6-Digit OTP", type: "password", placeholder: "123456" },
      },
      async authorize(credentials) {
        if (!credentials?.phone) {
          throw new Error("Mobile number is required");
        }
        // Mobile-OTP simulation: Mock OTP is "123456"
        if (credentials.otp !== "123456") {
          throw new Error("Invalid OTP. For demo/testing, use mock OTP: 123456");
        }

        return {
          id: "usr_yatrasathi_demo",
          name: "Aarav Sharma",
          phone: credentials.phone,
          email: "aarav.sharma@example.in",
          image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
        };
      },
    }),
  ],
  pages: {
    signIn: "/",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET || "yatrasathi_super_secret_jwt_key_2026_dev",
  callbacks: {
    async session({ session, token }) {
      if (session.user && token.sub) {
        (session.user as any).id = token.sub;
      }
      return session;
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
