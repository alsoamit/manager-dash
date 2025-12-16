// utils/requireAdmin.ts
import { redirect } from "next/navigation";
import { auth } from "@/auth";

/**
 * Server-side admin check utility
 * Use this in server components or server actions
 * Redirects to home if user is not an admin
 */
export async function requireAdmin() {
  const session = await auth();
  
  if (!session?.user) {
    redirect("/auth/login");
  }
  
  if (session.user.role !== "admin") {
    redirect("/");
  }
  
  return session;
}

/**
 * Check if user is admin (doesn't redirect)
 * Use this when you want to conditionally render based on admin status
 */
export async function isAdmin(): Promise<boolean> {
  const session = await auth();
  return session?.user?.role === "admin";
}
