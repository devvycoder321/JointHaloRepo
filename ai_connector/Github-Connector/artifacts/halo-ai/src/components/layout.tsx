import { Link, useLocation } from "wouter";
import { Terminal, MessageSquare, Github, Settings, LogOut } from "lucide-react";
import { useLogout } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";

export function Layout({ children }: { children: React.ReactNode }) {
  const [location, setLocation] = useLocation();
  const { mutate: logout } = useLogout();
  const queryClient = useQueryClient();

  const navItems = [
    { href: "/chat", icon: MessageSquare, label: "Chat" },
    { href: "/github", icon: Github, label: "GitHub" },
    { href: "/settings", icon: Settings, label: "Settings" },
  ];

  const handleLogout = () => {
    logout(undefined, {
      onSuccess: () => {
        queryClient.clear();
        setLocation("/login");
      },
    });
  };

  return (
    <div className="flex h-screen w-full bg-background text-foreground overflow-hidden font-mono text-sm selection:bg-primary/30">
      <div className="flex w-16 flex-col items-center border-r border-border bg-card py-4">
        <div className="mb-8 flex items-center justify-center rounded-lg bg-primary/10 p-2 text-primary">
          <Terminal size={24} strokeWidth={2} data-testid="icon-logo" />
        </div>
        
        <nav className="flex flex-1 flex-col items-center gap-4">
          {navItems.map((item) => {
            const isActive = location.startsWith(item.href);
            return (
              <Link 
                key={item.href} 
                href={item.href}
                className={`flex h-10 w-10 items-center justify-center rounded-md transition-colors ${
                  isActive 
                    ? "bg-primary text-primary-foreground" 
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
                title={item.label}
                data-testid={`link-nav-${item.label.toLowerCase()}`}
              >
                <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} />
              </Link>
            );
          })}
        </nav>

        <button
          onClick={handleLogout}
          className="mt-auto flex h-10 w-10 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
          title="Logout"
          data-testid="button-logout"
        >
          <LogOut size={20} strokeWidth={2} />
        </button>
      </div>
      <main className="flex flex-1 flex-col overflow-hidden relative">
        {children}
      </main>
    </div>
  );
}
