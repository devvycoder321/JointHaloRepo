import { useState } from "react";
import {
  useGetGithubConfig,
  useGetGithubRepos,
  useSaveGithubConfig,
  getGetGithubConfigQueryKey,
  getGetGithubReposQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Github as GithubIcon, ExternalLink, Lock, Globe, Loader2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

const tokenSchema = z.object({
  token: z.string().min(10, "Enter a valid GitHub personal access token"),
});

const LANGUAGE_COLORS: Record<string, string> = {
  TypeScript: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  JavaScript: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  Python: "bg-green-500/20 text-green-400 border-green-500/30",
  Rust: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  Go: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
  HTML: "bg-red-500/20 text-red-400 border-red-500/30",
  CSS: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  Shell: "bg-gray-500/20 text-gray-400 border-gray-500/30",
};

export default function Github() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [showTokenForm, setShowTokenForm] = useState(false);

  const { data: config, isLoading: configLoading } = useGetGithubConfig();
  const { data: repos, isLoading: reposLoading } = useGetGithubRepos({
    query: { enabled: config?.configured ?? false, queryKey: getGetGithubReposQueryKey() },
  });
  const saveConfig = useSaveGithubConfig();

  const form = useForm<z.infer<typeof tokenSchema>>({
    resolver: zodResolver(tokenSchema),
    defaultValues: { token: "" },
  });

  const onSubmit = (values: z.infer<typeof tokenSchema>) => {
    saveConfig.mutate(
      { data: { token: values.token } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetGithubConfigQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetGithubReposQueryKey() });
          setShowTokenForm(false);
          form.reset();
          toast({ title: "GitHub token saved" });
        },
        onError: () => {
          toast({ title: "Failed to save token", variant: "destructive" });
        },
      }
    );
  };

  if (configLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 size={20} className="animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="border-b border-border px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <GithubIcon size={20} className="text-primary" />
            <div>
              <h1 className="text-sm font-semibold" data-testid="text-page-title">GitHub</h1>
              {config?.configured && config.username && (
                <p className="text-xs text-muted-foreground" data-testid="text-github-username">
                  @{config.username}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {config?.configured && (
              <div className="flex items-center gap-1.5 text-xs text-green-400">
                <Check size={12} />
                <span>Connected</span>
              </div>
            )}
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowTokenForm(!showTokenForm)}
              data-testid="button-configure-token"
            >
              {config?.configured ? "Update Token" : "Connect GitHub"}
            </Button>
          </div>
        </div>
      </div>

      {(showTokenForm || !config?.configured) && (
        <div className="border-b border-border bg-card/30 px-6 py-4">
          <Card className="border-border bg-card">
            <CardHeader className="pb-3 pt-4 px-4">
              <CardTitle className="text-sm">Personal Access Token</CardTitle>
              <CardDescription className="text-xs">
                Generate a token at github.com/settings/tokens with repo scope
              </CardDescription>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="flex gap-2">
                  <FormField
                    control={form.control}
                    name="token"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormControl>
                          <Input
                            {...field}
                            type="password"
                            placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                            className="font-mono text-xs bg-background"
                            data-testid="input-github-token"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" size="sm" disabled={saveConfig.isPending} data-testid="button-save-token">
                    {saveConfig.isPending ? <Loader2 size={14} className="animate-spin" /> : "Save"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="flex-1 overflow-y-auto px-6 py-4">
        {!config?.configured ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
            <GithubIcon size={40} className="mb-4 opacity-20" />
            <p className="text-sm">Connect your GitHub account</p>
            <p className="text-xs opacity-60 mt-1">Enter a personal access token above to see your repositories</p>
          </div>
        ) : reposLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 size={16} className="animate-spin text-muted-foreground" />
          </div>
        ) : repos && repos.length > 0 ? (
          <div className="grid gap-2">
            {repos.map((repo) => (
              <div
                key={repo.id}
                className="flex items-center justify-between rounded-lg border border-border bg-card px-4 py-3 transition-colors hover:border-primary/30 hover:bg-card/80"
                data-testid={`repo-item-${repo.id}`}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    {repo.private ? (
                      <Lock size={12} className="shrink-0 text-muted-foreground" />
                    ) : (
                      <Globe size={12} className="shrink-0 text-muted-foreground" />
                    )}
                    <span className="truncate text-sm font-medium" data-testid={`text-repo-name-${repo.id}`}>
                      {repo.name}
                    </span>
                    {repo.language && (
                      <Badge
                        variant="outline"
                        className={`shrink-0 text-[10px] px-1.5 py-0 ${LANGUAGE_COLORS[repo.language] ?? "bg-muted text-muted-foreground border-border"}`}
                      >
                        {repo.language}
                      </Badge>
                    )}
                  </div>
                  {repo.description && (
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">{repo.description}</p>
                  )}
                </div>
                <a
                  href={repo.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-3 shrink-0 text-muted-foreground hover:text-primary"
                  data-testid={`link-repo-${repo.id}`}
                >
                  <ExternalLink size={14} />
                </a>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
            <GithubIcon size={32} className="mb-3 opacity-20" />
            <p className="text-sm">No repositories found</p>
          </div>
        )}
      </div>
    </div>
  );
}
