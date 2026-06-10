import { useState } from "react";
import {
  useAuthStatus,
  useSetupTotp,
  useGetAccessRequests,
  getAuthStatusQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Settings as SettingsIcon, KeyRound, Bot, RefreshCw, Check, Loader2, Users, Clock, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

export default function Settings() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [showNewQR, setShowNewQR] = useState(false);

  const { data: auth } = useAuthStatus();
  const setupTotp = useSetupTotp();
  const { data: accessRequests } = useGetAccessRequests({
    query: { enabled: auth?.role === "super_admin", queryKey: ["access-requests"] },
  });

  const handleRegenerateTotp = () => {
    setupTotp.mutate(undefined, {
      onSuccess: () => {
        setShowNewQR(true);
        queryClient.invalidateQueries({ queryKey: getAuthStatusQueryKey() });
        toast({ title: "New TOTP secret generated" });
      },
      onError: () => toast({ title: "Failed to regenerate TOTP", variant: "destructive" }),
    });
  };

  const pendingRequests = accessRequests?.filter((r) => r.status === "pending") ?? [];

  return (
    <div className="flex h-full flex-col overflow-y-auto">
      <div className="border-b border-border px-6 py-4">
        <div className="flex items-center gap-3">
          <SettingsIcon size={20} className="text-primary" />
          <h1 className="text-sm font-semibold">Settings</h1>
          {pendingRequests.length > 0 && (
            <Badge variant="destructive" className="text-[10px] px-1.5 py-0">{pendingRequests.length} pending</Badge>
          )}
        </div>
      </div>

      <div className="flex-1 px-6 py-6 space-y-4 max-w-2xl">
        {/* Account info */}
        <Card className="border-border bg-card">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <ShieldCheck size={16} className="text-primary" />
              <CardTitle className="text-sm">Account</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-2 text-xs">
            <div className="flex items-center justify-between rounded-md border border-border bg-background/50 px-3 py-2">
              <span className="text-muted-foreground">Email</span>
              <span className="font-mono text-foreground">{auth?.email ?? "—"}</span>
            </div>
            <div className="flex items-center justify-between rounded-md border border-border bg-background/50 px-3 py-2">
              <span className="text-muted-foreground">Role</span>
              <Badge variant="outline" className={`text-[10px] ${auth?.role === "super_admin" ? "border-primary/30 text-primary bg-primary/10" : "border-border"}`}>
                {auth?.role ?? "—"}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Access requests - admin only */}
        {auth?.role === "super_admin" && (
          <Card className="border-border bg-card">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Users size={16} className="text-primary" />
                <CardTitle className="text-sm">Access Requests</CardTitle>
                {pendingRequests.length > 0 && (
                  <Badge variant="destructive" className="text-[10px] px-1.5 py-0">{pendingRequests.length}</Badge>
                )}
              </div>
              <CardDescription className="text-xs">People requesting access to this system</CardDescription>
            </CardHeader>
            <CardContent>
              {!accessRequests || accessRequests.length === 0 ? (
                <p className="text-xs text-muted-foreground py-2">No access requests yet.</p>
              ) : (
                <div className="space-y-2">
                  {accessRequests.map((req) => (
                    <div key={req.id} className="rounded-md border border-border bg-background/50 px-3 py-2 text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-foreground">{req.name}</span>
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Clock size={10} />
                          <span className="text-[10px]">{new Date(req.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <p className="text-muted-foreground font-mono">{req.email}</p>
                      {req.reason && <p className="text-muted-foreground italic">"{req.reason}"</p>}
                      <Badge variant={req.status === "pending" ? "destructive" : "outline"} className="text-[10px] px-1.5 py-0">
                        {req.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* AI Model */}
        <Card className="border-border bg-card">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Bot size={16} className="text-primary" />
              <CardTitle className="text-sm">AI Model</CardTitle>
            </div>
            <CardDescription className="text-xs">Azure DeepSeek configuration</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-xs">
            <div className="flex items-center justify-between rounded-md border border-border bg-background/50 px-3 py-2">
              <span className="text-muted-foreground">Provider</span>
              <Badge variant="outline" className="text-[10px] border-primary/30 text-primary bg-primary/10">Azure OpenAI</Badge>
            </div>
            <div className="flex items-center justify-between rounded-md border border-border bg-background/50 px-3 py-2">
              <span className="text-muted-foreground">Model</span>
              <span className="font-mono text-foreground">deepseek-v4</span>
            </div>
            <div className="flex items-center justify-between rounded-md border border-border bg-background/50 px-3 py-2">
              <span className="text-muted-foreground">Vision</span>
              <div className="flex items-center gap-1.5 text-green-400"><Check size={11} /><span>Enabled</span></div>
            </div>
            <div className="flex items-center justify-between rounded-md border border-border bg-background/50 px-3 py-2">
              <span className="text-muted-foreground">File uploads</span>
              <div className="flex items-center gap-1.5 text-green-400"><Check size={11} /><span>Any type, no limit</span></div>
            </div>
          </CardContent>
        </Card>

        {/* 2FA */}
        <Card className="border-border bg-card">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <KeyRound size={16} className="text-primary" />
              <CardTitle className="text-sm">Two-Factor Authentication</CardTitle>
            </div>
            <CardDescription className="text-xs">TOTP via Google Authenticator, Microsoft Authenticator, or Authy</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between rounded-md border border-border bg-background/50 px-3 py-2 text-xs">
              <span className="text-muted-foreground">Status</span>
              <div className="flex items-center gap-1.5 text-green-400"><Check size={12} /><span>Enabled</span></div>
            </div>

            {showNewQR && setupTotp.data && (
              <div className="rounded-md border border-border bg-background/50 p-4 text-center">
                <p className="mb-3 text-xs text-muted-foreground">Scan this new QR code with your authenticator app</p>
                <img src={setupTotp.data.qrCodeUrl} alt="New TOTP QR Code" className="mx-auto h-36 w-36 rounded border border-border" />
                <p className="mt-3 font-mono text-[10px] text-muted-foreground break-all">{setupTotp.data.secret}</p>
                <Button size="sm" variant="outline" className="mt-3 text-xs" onClick={() => setShowNewQR(false)}>Done</Button>
              </div>
            )}

            <Button size="sm" variant="outline" className="w-full text-xs" onClick={handleRegenerateTotp} disabled={setupTotp.isPending}>
              {setupTotp.isPending ? <Loader2 size={12} className="mr-1.5 animate-spin" /> : <RefreshCw size={12} className="mr-1.5" />}
              Regenerate TOTP Secret
            </Button>
          </CardContent>
        </Card>

        {/* Desktop shortcut */}
        <Card className="border-border bg-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Desktop Shortcut</CardTitle>
            <CardDescription className="text-xs">Access Halo AI directly from your desktop</CardDescription>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground space-y-2">
            <p>To add this app as a desktop shortcut on Windows:</p>
            <ol className="list-decimal list-inside space-y-1 pl-1">
              <li>Open Chrome or Edge</li>
              <li>Navigate to this app's URL</li>
              <li>Click the install icon in the address bar (or menu → "Install as app")</li>
              <li>Click "Install" — it opens in its own window like a native app</li>
            </ol>
            <p className="text-[10px] opacity-60 pt-1">Works on Chrome, Edge, and Brave. No browser UI, no tabs — just the app.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
