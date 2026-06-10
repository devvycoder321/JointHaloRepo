import { useState, useEffect, useRef, useCallback } from "react";
import {
  useGetChatSessions,
  useGetChatMessages,
  useSendMessage,
  useCreateChatSession,
  useDeleteChatSession,
  useGenerateImage,
  getGetChatSessionsQueryKey,
  getGetChatMessagesQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, Send, Loader2, MessageSquare, Mic, MicOff, Paperclip, X, Image as ImageIcon, ImagePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import ReactMarkdown from "react-markdown";

type Attachment = { name: string; type: string; data: string; size: number; preview?: string };

async function fileToAttachment(file: File): Promise<Attachment> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(",")[1] ?? result;
      resolve({
        name: file.name,
        type: file.type || "application/octet-stream",
        data: base64,
        size: file.size,
        preview: file.type.startsWith("image/") ? result : undefined,
      });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)}MB`;
}

export default function Chat() {
  const [selectedSessionId, setSelectedSessionId] = useState<number | null>(null);
  const [input, setInput] = useState("");
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [imagePrompt, setImagePrompt] = useState("");
  const [showImageGen, setShowImageGen] = useState(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: sessions, isLoading: sessionsLoading } = useGetChatSessions();
  const { data: messages, isLoading: messagesLoading } = useGetChatMessages(
    selectedSessionId ? { sessionId: String(selectedSessionId) } : undefined,
    { query: { enabled: !!selectedSessionId, queryKey: getGetChatMessagesQueryKey(selectedSessionId ? { sessionId: String(selectedSessionId) } : undefined) } }
  );

  const createSession = useCreateChatSession();
  const deleteSession = useDeleteChatSession();
  const sendMessage = useSendMessage();
  const generateImage = useGenerateImage();

  useEffect(() => {
    if (sessions && sessions.length > 0 && !selectedSessionId) setSelectedSessionId(sessions[0].id);
  }, [sessions, selectedSessionId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const addFiles = useCallback(async (files: FileList | File[]) => {
    const arr = Array.from(files);
    try {
      const atts = await Promise.all(arr.map(fileToAttachment));
      setAttachments((prev) => [...prev, ...atts]);
    } catch {
      toast({ title: "Failed to read file", variant: "destructive" });
    }
  }, [toast]);

  useEffect(() => {
    const onPaste = (e: ClipboardEvent) => {
      if (e.clipboardData?.files?.length) {
        e.preventDefault();
        addFiles(e.clipboardData.files);
      }
    };
    window.addEventListener("paste", onPaste);
    return () => window.removeEventListener("paste", onPaste);
  }, [addFiles]);

  const toggleVoice = () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) {
      toast({ title: "Voice not supported in this browser", variant: "destructive" });
      return;
    }

    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const recognition: any = new SR();
    recognitionRef.current = recognition;
    recognition.lang = "en-US";
    recognition.continuous = true;
    recognition.interimResults = false;

    recognition.onresult = (event: { results: SpeechRecognitionResultList; resultIndex: number }) => {
      const transcript = Array.from(event.results)
        .slice(event.resultIndex)
        .filter((r: SpeechRecognitionResult) => r.isFinal)
        .map((r: SpeechRecognitionResult) => r[0].transcript)
        .join(" ");
      if (transcript) setInput((prev) => (prev ? prev + " " + transcript : transcript));
    };

    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
    recognition.start();
    setIsListening(true);
  };

  const handleNewSession = () => {
    createSession.mutate(
      { data: { title: "New Chat" } },
      {
        onSuccess: (session) => {
          queryClient.invalidateQueries({ queryKey: getGetChatSessionsQueryKey() });
          setSelectedSessionId(session.id);
        },
      }
    );
  };

  const handleDeleteSession = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    deleteSession.mutate(
      { id },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetChatSessionsQueryKey() });
          if (selectedSessionId === id) setSelectedSessionId(sessions?.find((s) => s.id !== id)?.id ?? null);
        },
      }
    );
  };

  const handleSend = () => {
    if ((!input.trim() && attachments.length === 0) || !selectedSessionId || sendMessage.isPending) return;
    const content = input.trim() || "(see attached file)";
    const atts = [...attachments];
    setInput("");
    setAttachments([]);
    sendMessage.mutate(
      { data: { sessionId: selectedSessionId, content, attachments: atts.map(({ preview: _p, ...a }) => a) } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetChatMessagesQueryKey({ sessionId: String(selectedSessionId) }) });
          queryClient.invalidateQueries({ queryKey: getGetChatSessionsQueryKey() });
        },
        onError: () => toast({ title: "Failed to send message", variant: "destructive" }),
      }
    );
  };

  const handleGenerateImage = () => {
    if (!imagePrompt.trim()) return;
    setGeneratedImageUrl(null);
    generateImage.mutate(
      { data: { prompt: imagePrompt } },
      {
        onSuccess: (result) => {
          if (result.url) setGeneratedImageUrl(result.url);
          else if (result.b64) setGeneratedImageUrl(`data:image/png;base64,${result.b64}`);
          else toast({ title: result.error || "Image generation failed", variant: "destructive" });
        },
        onError: () => toast({ title: "Image generation failed", variant: "destructive" }),
      }
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  return (
    <div className="flex h-full w-full overflow-hidden">
      {/* Sidebar */}
      <div className="flex w-56 flex-col border-r border-border bg-card/50">
        <div className="flex items-center justify-between border-b border-border px-3 py-3">
          <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Sessions</span>
          <Button size="icon" variant="ghost" className="h-6 w-6" onClick={handleNewSession} disabled={createSession.isPending}>
            {createSession.isPending ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto py-1">
          {sessionsLoading ? (
            <div className="flex items-center justify-center py-8"><Loader2 size={16} className="animate-spin text-muted-foreground" /></div>
          ) : sessions && sessions.length > 0 ? (
            sessions.map((session) => (
              <div
                key={session.id}
                onClick={() => setSelectedSessionId(session.id)}
                className={`group flex cursor-pointer items-center justify-between px-3 py-2 transition-colors ${selectedSessionId === session.id ? "bg-primary/10 text-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-medium">{session.title}</p>
                  <p className="text-[10px] text-muted-foreground">{session.messageCount} msgs</p>
                </div>
                <button onClick={(e) => handleDeleteSession(session.id, e)} className="ml-1 hidden h-5 w-5 shrink-0 items-center justify-center rounded text-muted-foreground hover:text-destructive group-hover:flex">
                  <Trash2 size={12} />
                </button>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center px-3 py-8 text-center text-xs text-muted-foreground">
              <MessageSquare size={20} className="mb-2 opacity-40" />
              <p>No sessions yet</p><p>Create one to start</p>
            </div>
          )}
        </div>
      </div>

      {/* Main chat area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {selectedSessionId ? (
          <>
            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
              {messagesLoading ? (
                <div className="flex items-center justify-center py-8"><Loader2 size={16} className="animate-spin text-muted-foreground" /></div>
              ) : messages && messages.length > 0 ? (
                messages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-card border border-border text-foreground"}`}>
                      {msg.role === "assistant" ? (
                        <div className="prose prose-invert prose-sm max-w-none prose-pre:bg-background/50 prose-pre:border prose-pre:border-border prose-code:text-primary prose-code:before:content-none prose-code:after:content-none">
                          <ReactMarkdown>{msg.content}</ReactMarkdown>
                        </div>
                      ) : (
                        <p className="whitespace-pre-wrap">{msg.content}</p>
                      )}
                      <p className={`mt-1 text-[10px] ${msg.role === "user" ? "text-primary-foreground/60" : "text-muted-foreground"}`}>
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
                  <MessageSquare size={32} className="mb-3 opacity-20" />
                  <p className="text-sm">Start a conversation</p>
                  <p className="text-xs opacity-60 mt-1">Paste screenshots, attach any file, or use voice</p>
                </div>
              )}
              {sendMessage.isPending && (
                <div className="flex justify-start">
                  <div className="rounded-lg border border-border bg-card px-3 py-2">
                    <Loader2 size={14} className="animate-spin text-muted-foreground" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Image Generator Panel */}
            {showImageGen && (
              <div className="border-t border-border bg-card/30 px-3 py-3 space-y-2">
                <div className="flex items-center gap-2">
                  <ImageIcon size={14} className="text-primary shrink-0" />
                  <span className="text-xs font-medium text-muted-foreground">Image Generation</span>
                  <button onClick={() => { setShowImageGen(false); setGeneratedImageUrl(null); }} className="ml-auto text-muted-foreground hover:text-foreground"><X size={14} /></button>
                </div>
                <div className="flex gap-2">
                  <input
                    value={imagePrompt}
                    onChange={(e) => setImagePrompt(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleGenerateImage()}
                    placeholder="Describe the image..."
                    className="flex-1 rounded-md border border-border bg-background/50 px-3 py-1.5 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-primary/50"
                  />
                  <Button size="sm" onClick={handleGenerateImage} disabled={generateImage.isPending || !imagePrompt.trim()} className="text-xs h-8">
                    {generateImage.isPending ? <Loader2 size={12} className="animate-spin mr-1" /> : <ImageIcon size={12} className="mr-1" />}
                    Generate
                  </Button>
                </div>
                {generatedImageUrl && (
                  <div className="flex gap-3 items-start">
                    <img src={generatedImageUrl} alt="Generated" className="max-h-48 rounded-md border border-border object-contain" />
                    <a href={generatedImageUrl} download="halo-generated.png" className="text-[10px] text-primary hover:underline mt-1">Download</a>
                  </div>
                )}
              </div>
            )}

            {/* Attachments preview */}
            {attachments.length > 0 && (
              <div className="border-t border-border px-3 py-2 flex flex-wrap gap-2">
                {attachments.map((att, i) => (
                  <div key={i} className="relative flex items-center gap-1.5 rounded-md border border-border bg-muted/40 px-2 py-1 text-xs">
                    {att.preview ? (
                      <img src={att.preview} alt={att.name} className="h-8 w-8 rounded object-cover" />
                    ) : (
                      <Paperclip size={12} className="text-muted-foreground" />
                    )}
                    <div className="max-w-[120px]">
                      <p className="truncate text-[10px] font-medium">{att.name}</p>
                      <p className="text-[9px] text-muted-foreground">{formatSize(att.size)}</p>
                    </div>
                    <button onClick={() => setAttachments((prev) => prev.filter((_, j) => j !== i))} className="text-muted-foreground hover:text-destructive ml-1">
                      <X size={11} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Input bar */}
            <div className="border-t border-border p-3">
              <div className="flex items-end gap-2">
                <div className="flex flex-col gap-1">
                  <button
                    onClick={toggleVoice}
                    title={isListening ? "Stop voice" : "Voice input"}
                    className={`flex h-9 w-9 items-center justify-center rounded-md border transition-colors ${isListening ? "border-red-500/50 bg-red-500/10 text-red-400 animate-pulse" : "border-border text-muted-foreground hover:text-foreground hover:bg-muted"}`}
                  >
                    {isListening ? <MicOff size={15} /> : <Mic size={15} />}
                  </button>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    title="Attach file or image"
                    className="flex h-9 w-9 items-center justify-center rounded-md border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                  >
                    <Paperclip size={15} />
                  </button>
                  <button
                    onClick={() => setShowImageGen((v) => !v)}
                    title="Generate image"
                    className={`flex h-9 w-9 items-center justify-center rounded-md border transition-colors ${showImageGen ? "border-primary/50 bg-primary/10 text-primary" : "border-border text-muted-foreground hover:text-foreground hover:bg-muted"}`}
                  >
                    <ImagePlus size={15} />
                  </button>
                </div>
                <Textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask anything... paste screenshots (Ctrl+V), attach files, or use voice — Enter to send"
                  className="min-h-[80px] max-h-[300px] resize-none bg-card border-border text-sm font-mono flex-1"
                  disabled={sendMessage.isPending}
                />
                <Button size="icon" onClick={handleSend} disabled={(!input.trim() && attachments.length === 0) || sendMessage.isPending} className="h-10 w-10 shrink-0">
                  {sendMessage.isPending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                </Button>
              </div>
              <p className="mt-1 text-[10px] text-muted-foreground px-1">Ctrl+V to paste screenshots · Attach any file type · No size limits</p>
            </div>

            <input ref={fileInputRef} type="file" multiple accept="*/*" className="hidden" onChange={(e) => e.target.files && addFiles(e.target.files)} />
          </>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center text-muted-foreground">
            <MessageSquare size={40} className="mb-4 opacity-20" />
            <p className="text-sm">No session selected</p>
            <Button variant="outline" size="sm" className="mt-3" onClick={handleNewSession}>
              <Plus size={14} className="mr-1" /> New session
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
