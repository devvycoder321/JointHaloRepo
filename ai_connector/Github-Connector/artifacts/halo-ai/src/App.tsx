import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuthStatus } from "@workspace/api-client-react";
import { useEffect } from "react";

import Login from "@/pages/login";
import Chat from "@/pages/chat";
import Github from "@/pages/github";
import Settings from "@/pages/settings";
import NotFound from "@/pages/not-found";
import { Layout } from "@/components/layout";
import { Loader2 } from "lucide-react";

const queryClient = new QueryClient();

function ProtectedRoute({ component: Component, ...rest }: { component: React.ComponentType<unknown>; [key: string]: unknown }) {
  const { data: auth, isLoading } = useAuthStatus();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading && auth && !auth.authenticated) {
      setLocation("/login");
    }
  }, [auth, isLoading, setLocation]);

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!auth?.authenticated) return null;

  return (
    <Layout>
      <Component {...rest} />
    </Layout>
  );
}

function RootRoute() {
  const { data: auth, isLoading } = useAuthStatus();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading && auth) {
      if (!auth.authenticated) {
        setLocation("/login");
      } else {
        setLocation("/chat");
      }
    }
  }, [auth, isLoading, setLocation]);

  return (
    <div className="flex h-screen w-full items-center justify-center bg-background">
      <Loader2 className="h-6 w-6 animate-spin text-primary" />
    </div>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={RootRoute} />
      <Route path="/login" component={Login} />
      <Route path="/chat">
        {(params) => <ProtectedRoute component={Chat} params={params} />}
      </Route>
      <Route path="/github">
        {(params) => <ProtectedRoute component={Github} params={params} />}
      </Route>
      <Route path="/settings">
        {(params) => <ProtectedRoute component={Settings} params={params} />}
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
