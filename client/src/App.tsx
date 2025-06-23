import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import ErrorBoundary from "@/components/error-boundary";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Home from "@/pages/home";
import Tournaments from "@/pages/tournaments";
import Clans from "@/pages/clans";
import ClanDetails from "@/pages/clan-details";
import Messages from "@/pages/messages";
import ProfileNew from "@/pages/profile-new";
import Settings from "@/pages/settings";
import Discover from "@/pages/discover";
import Gaming from "@/pages/gaming";
import { useAuth } from "@/hooks/useAuth";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      {isLoading || !isAuthenticated ? (
        <Route path="/" component={Landing} />
      ) : (
        <>
          <Route path="/" component={Home} />
          <Route path="/tournaments" component={Tournaments} />
          <Route path="/clans" component={Clans} />
          <Route path="/clan/:id" component={ClanDetails} />
          <Route path="/messages" component={Messages} />
          <Route path="/discover" component={Discover} />
          <Route path="/gaming" component={Gaming} />
          <Route path="/profile/:userId?" component={ProfileNew} />
          <Route path="/settings" component={Settings} />
        </>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
