import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

const API = process.env.NEXT_PUBLIC_API_BASE!;

const authConfig = NextAuth({
  providers: [
    Credentials({
      name: "Email & Password",
      credentials: { 
        email: { label: "Email", type: "email" }, 
        password: { label: "Password", type: "password" } 
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        
        try {
          // Используем полный URL для серверной стороны NextAuth
          const loginUrl = typeof window === 'undefined' 
            ? `${API}/api/auth/login`
            : '/api/backend/auth/login';
          
          const res = await fetch(loginUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
              email: credentials.email, 
              password: credentials.password 
            })
          });
          
          if (!res.ok) return null;
          
          const user = await res.json();
          return { 
            id: user.id, 
            email: user.email, 
            name: user.name,
            accessToken: user.accessToken
          };
        } catch (error) {
          console.error('Auth error:', error);
          return null;
        }
      }
    })
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.userId = user.id;
        token.apiAccessToken = (user as typeof user & { accessToken?: string }).accessToken;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        (session as typeof session & { userId?: string; apiAccessToken?: string }).userId = token.userId as string;
        (session as typeof session & { userId?: string; apiAccessToken?: string }).apiAccessToken = token.apiAccessToken as string;
      }
      return session;
    }
  },
  pages: {
    signIn: "/auth/signin"
  },
  trustHost: true
});

export const { handlers, auth, signIn, signOut } = authConfig;
export const GET = handlers.GET;
export const POST = handlers.POST;
