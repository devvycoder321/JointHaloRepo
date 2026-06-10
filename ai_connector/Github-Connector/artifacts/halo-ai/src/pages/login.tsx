import { useAuthStatus, useLogin, useSetupTotp, useVerifyTotp, useRequestAccess } from "@workspace/api-client-react";
import { useLocation } from "wouter";
import { useEffect, useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Terminal, Loader2, KeyRound, Mail, Lock, UserPlus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type Step = "login" | "totp_setup" | "totp_verify" | "request_access";

const loginSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(1, "Password required"),
});

const totpSchema = z.object({
  token: z.string().length(6, "Must be 6 digits").regex(/^\d+$/, "Digits only"),
});

const requestSchema = z.object({
  name: z.string().min(1, "Name required"),
  email: z.string().email("Invalid email"),
  reason: z.string().optional(),
});

export default function Login() {
  const { data: auth, isLoading: isAuthLoading } = useAuthStatus();
  const { mutate: loginFn, isPending: isLoggingIn } = useLogin();
  const { mutate: setupTotp, data: totpSetupData, isPending: isSettingUp } = useSetupTotp();
  const { mutate: verifyTotp, isPending: isVerifying } = useVerifyTotp();
  const { mutate: requestAccess, isPending: isRequesting } = useRequestAccess();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [step, setStep] = useState<Step>("login");
  const [requestDone, setRequestDone] = useState(false);

  useEffect(() => {
    if (auth?.authenticated) setLocation("/chat");
  }, [auth, setLocation]);

  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const totpForm = useForm<z.infer<typeof totpSchema>>({
    resolver: zodResolver(totpSchema),
    defaultValues: { token: "" },
  });

  const requestForm = useForm<z.infer<typeof requestSchema>>({
    resolver: zodResolver(requestSchema),
    defaultValues: { name: "", email: "", reason: "" },
  });

  const onLogin = (values: z.infer<typeof loginSchema>) => {
    loginFn(
      { data: values },
      {
        onSuccess: (result) => {
          if (result.step === "totp_setup") {
            setupTotp(undefined, {
              onSuccess: () => setStep("totp_setup"),
              onError: () => toast({ title: "Failed to setup TOTP", variant: "destructive" }),
            });
          } else {
            setStep("totp_verify");
          }
        },
        onError: () => toast({ title: "Invalid email or password", variant: "destructive" }),
      }
    );
  };

  const onVerify = (values: z.infer<typeof totpSchema>) => {
    verifyTotp(
      { data: { token: values.token } },
      {
        onSuccess: (res) => {
          if (res.authenticated) {
            setLocation("/chat");
            toast({ title: "Welcome to Halo AI" });
          } else {
            toast({ title: "Invalid token", variant: "destructive" });
          }
        },
        onError: () => toast({ title: "Invalid token", variant: "destructive" }),
      }
    );
  };

  const onRequestAccess = (values: z.infer<typeof requestSchema>) => {
    requestAccess(
      { data: { email: values.email, name: values.name, reason: values.reason || undefined } },
      {
        onSuccess: () => setRequestDone(true),
        onError: () => toast({ title: "Failed to submit request", variant: "destructive" }),
      }
    );
  };

  if (isAuthLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4 font-mono">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4 rounded-xl bg-primary/10 p-3 ring-1 ring-primary/20 shadow-[0_0_15px_rgba(0,240,255,0.2)]">
            <Terminal size={32} className="text-primary" strokeWidth={2} />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">HALO AI</h1>
          <p className="mt-2 text-sm text-muted-foreground">Private Workspace Interface</p>
        </div>

        {step === "login" && (
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <KeyRound size={18} className="text-primary" />
                Sign In
              </CardTitle>
              <CardDescription>Enter your credentials to access the workspace</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...loginForm}>
                <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-4">
                  <FormField
                    control={loginForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-1.5"><Mail size={13} />Email</FormLabel>
                        <FormControl>
                          <Input placeholder="you@example.com" autoComplete="email" className="bg-background/50 border-border/50 focus-visible:ring-primary/50" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={loginForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-1.5"><Lock size={13} />Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="••••••••" autoComplete="current-password" className="bg-background/50 border-border/50 focus-visible:ring-primary/50" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full h-12 font-medium" disabled={isLoggingIn || isSettingUp}>
                    {(isLoggingIn || isSettingUp) ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Continue
                  </Button>
                </form>
              </Form>
              <div className="mt-4 text-center">
                <button onClick={() => setStep("request_access")} className="text-xs text-muted-foreground hover:text-primary transition-colors">
                  Don't have access? Request it →
                </button>
              </div>
            </CardContent>
          </Card>
        )}

        {(step === "totp_setup" || step === "totp_verify") && (
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <KeyRound size={18} className="text-primary" />
                {step === "totp_setup" ? "Setup Authenticator" : "Two-Factor Auth"}
              </CardTitle>
              <CardDescription>
                {step === "totp_setup"
                  ? "Scan this QR code with Google Authenticator, Microsoft Authenticator, or Authy"
                  : "Enter the 6-digit code from your authenticator app"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {step === "totp_setup" && totpSetupData && (
                <div className="mb-5 flex flex-col items-center space-y-3 rounded-md border border-border bg-muted/30 p-4">
                  <div className="rounded-md bg-white p-2">
                    <img src={totpSetupData.qrCodeUrl} alt="TOTP QR Code" className="h-48 w-48" />
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground mb-1">Or enter manually:</p>
                    <code className="rounded bg-background px-2 py-1 text-xs text-primary select-all break-all">{totpSetupData.secret}</code>
                  </div>
                  <p className="text-xs text-muted-foreground text-center">After scanning, enter the code below to verify</p>
                </div>
              )}
              <Form {...totpForm}>
                <form onSubmit={totpForm.handleSubmit(onVerify)} className="space-y-4">
                  <FormField
                    control={totpForm.control}
                    name="token"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Authentication Code</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="000000"
                            autoComplete="one-time-code"
                            inputMode="numeric"
                            maxLength={6}
                            className="font-mono text-lg tracking-[0.5em] h-12 bg-background/50 border-border/50 focus-visible:ring-primary/50 text-center"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full h-12 font-medium" disabled={isVerifying}>
                    {isVerifying ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    {step === "totp_setup" ? "Verify & Activate" : "Unlock Workspace"}
                  </Button>
                </form>
              </Form>
              <div className="mt-3 text-center">
                <button onClick={() => setStep("login")} className="text-xs text-muted-foreground hover:text-primary transition-colors">← Back to sign in</button>
              </div>
            </CardContent>
          </Card>
        )}

        {step === "request_access" && (
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <UserPlus size={18} className="text-primary" />
                Request Access
              </CardTitle>
              <CardDescription>This is a private system. Submit a request and the admin will review it.</CardDescription>
            </CardHeader>
            <CardContent>
              {requestDone ? (
                <div className="py-6 text-center space-y-2">
                  <div className="text-4xl">✓</div>
                  <p className="text-sm font-medium">Request submitted</p>
                  <p className="text-xs text-muted-foreground">The admin will review your request and contact you.</p>
                  <button onClick={() => setStep("login")} className="mt-3 text-xs text-primary hover:underline">← Back to sign in</button>
                </div>
              ) : (
                <Form {...requestForm}>
                  <form onSubmit={requestForm.handleSubmit(onRequestAccess)} className="space-y-4">
                    <FormField control={requestForm.control} name="name" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl><Input placeholder="Your name" className="bg-background/50" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={requestForm.control} name="email" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl><Input placeholder="you@example.com" className="bg-background/50" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={requestForm.control} name="reason" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Reason (optional)</FormLabel>
                        <FormControl><Input placeholder="Why do you need access?" className="bg-background/50" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <Button type="submit" className="w-full h-12" disabled={isRequesting}>
                      {isRequesting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                      Submit Request
                    </Button>
                  </form>
                </Form>
              )}
              {!requestDone && (
                <div className="mt-3 text-center">
                  <button onClick={() => setStep("login")} className="text-xs text-muted-foreground hover:text-primary transition-colors">← Back to sign in</button>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
