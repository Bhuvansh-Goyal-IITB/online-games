import NextAuth from "next-auth";
import authConfig from "./auth.config";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const isLoggedIn = !!req.auth;

  if (isLoggedIn && authRoutes.includes(req.nextUrl.pathname)) {
    return Response.redirect(new URL("/", req.nextUrl.origin));
  }
});

const authRoutes = ["/auth/login", "/auth/sign-up"];
