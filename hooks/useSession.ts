import { useSession as useNextAuthSession } from "next-auth/react";

const useSession = () => {
  const { data: session, status, update } = useNextAuthSession({
    required: false,
  });

  return {
    session: {
      user: session?.user,
      setSession: null,
      setProfile: null,
    },
    loading: status === "loading",
    enabled: !!session?.user?.accessToken,
    isProfileLoading: status === "loading",
    sub: session?.user?.sub,
    error: null,
  };
};

export default useSession;
