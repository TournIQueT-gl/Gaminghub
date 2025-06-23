import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";

export function useAuth() {
  const { data: user, isLoading, error } = useQuery({
    queryKey: ["/api/auth/user"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const logout = () => {
    window.location.href = '/api/logout';
  };

  const login = () => {
    window.location.href = '/api/login';
  };

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    isGuest: !user && !isLoading,
    logout,
    login,
    error,
  };
}
