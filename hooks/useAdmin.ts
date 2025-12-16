// hooks/useAdmin.ts
import useSession from "./useSession";

/**
 * Client-side hook to check if current user is an admin
 * Use this in client components
 */
export function useAdmin() {
  const { session, loading } = useSession();
  const isAdmin = session?.user?.role === "admin";
  
  return {
    isAdmin,
    isLoading: loading,
  };
}
