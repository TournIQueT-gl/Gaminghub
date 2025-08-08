import { useQuery } from "@tanstack/react-query";
import { getQueryFn, queryClient } from "@/lib/queryClient";

export function useAuth() {
  const { data: user, isLoading, error } = useQuery({
    queryKey: ["/api/auth/user"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const logout = async () => {
    try {
      const response = await fetch('/api/logout', { 
        method: 'GET',
        credentials: 'include'
      });
      
      if (response.ok) {
        // Clear the React Query cache to remove user data
        queryClient.clear();
        // Force reload to ensure clean state
        window.location.reload();
      } else {
        console.error('Logout failed');
        // Fallback to redirect
        window.location.href = '/api/logout';
      }
    } catch (error) {
      console.error('Logout error:', error);
      // Fallback to redirect
      window.location.href = '/api/logout';
    }
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
