import { useEffect, useMemo, useRef, useState } from "react";
import {
  Search,
  Send,
  Inbox,
  CheckCheck,
  Image as ImageIcon,
  Paperclip,
  Smile,
  MoreVertical,
  CheckCircle2,
  Plus,
  Phone,
  Video,
  Info,
} from "lucide-react";
import { localStore } from "@/data";
import type { Conversation, Message } from "@/types/domain";
import { cn, timeAgo, formatClock } from "@/lib/utils";
import { Avatar } from "@/components/ui/Avatar";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { Separator } from "@/components/ui/Separator";
import { ImageWithFallback } from "@/components/ui/ImageWithFallback";
import { Page, PageHeader } from "@/components/layout/Page";
import { StatusDot } from "@/components/ui/Atoms";

export function MessagesPage() {
  const me = localStore.getUser("u1")!;
  const initial = localStore.getConversations();
  const [conversations, setConversations] = useState<Conversation[]>(initial);
  const [activeId, setActiveId] = useState<string | null>(initial[0]?.id ?? null);
  const [messagesByConv, setMessagesByConv] = useState<Record<string, Message[]>>(
    () => Object.fromEntries(initial.map((c) => [c.id, localStore.getMessages(c.id)])),
  );
  const [query, setQuery] = useState("");
  const [draft, setDraft] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const active = useMemo(
    () => conversations.find((c) => c.id === activeId) ?? null,
    [conversations, activeId],
  );

  const filtered = useMemo(() => {
    if (!query) return conversations;
    const q = query.toLowerCase();
    return conversations.filter(
      (c) =>
        c.participants.some((p) => p.name.toLowerCase().includes(q) || p.username.includes(q)) ||
        c.listing?.title.toLowerCase().includes(q),
    );
  }, [conversations, query]);

  useEffect(() => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [activeId, messagesByConv]);

  const send = () => {
    if (!active || !draft.trim()) return;
    const msg: Message = {
      id: `m${Date.now()}`,
      conversationId: active.id,
      sender: {
        id: me.id,
        name: me.name,
        username: me.username,
        avatar: me.avatar,
      },
      content: draft.trim(),
      read: false,
      createdAt: new Date().toISOString(),
    };
    setMessagesByConv((prev) => ({
      ...prev,
      [active.id]: [...(prev[active.id] ?? []), msg],
    }));
    setConversations((prev) =>
      prev.map((c) =>
        c.id === active.id
          ? { ...c, lastMessage: msg, updatedAt: msg.createdAt, unreadCount: 0 }
          : c,
      ),
    );
    setDraft("");

    // simulate reply
    setTimeout(() => {
      const other = active.participants.find((p) => p.id !== me.id) ?? active.participants[0]!;
      const reply: Message = {
        id: `m${Date.now() + 1}`,
        conversationId: active.id,
        sender: other,
        content: pickReply(draft),
        read: true,
        createdAt: new Date().toISOString(),
      };
      setMessagesByConv((prev) => ({
        ...prev,
        [active.id]: [...(prev[active.id] ?? []), reply],
      }));
      setConversations((prev) =>
        prev.map((c) =>
          c.id === active.id ? { ...c, lastMessage: reply, updatedAt: reply.createdAt } : c,
        ),
      );
    }, 1100);
  };

  return (
    <Page padded>
      <PageHeader
        eyebrow="//INBOX"
        title="Messages"
        description="Your floor's fastest thread. Pickup times, offers, follow-ups — all in one place."
        actions={
          <Button variant="primary" size="sm" leftIcon={<Plus className="h-3 w-3" />}>
            NEW_THREAD
          </Button>
        }
      />

      <div className="grid h-[calc(100dvh-220px)] min-h-[560px] grid-cols-1 overflow-hidden border border-line bg-ink-100 lg:grid-cols-[340px_1fr]">
        {/* List */}
        <aside className="flex h-full min-h-0 flex-col border-b border-line lg:border-b-0 lg:border-r">
          <div className="border-b border-line p-3">
            <Input
              placeholder="Search threads, sellers, listings…"
              leftAddon={<Search className="h-3.5 w-3.5" strokeWidth={1.5} />}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              size="sm"
            />
          </div>
          <div className="flex-1 overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="grid h-full place-items-center p-6">
                <EmptyState
                  variant="ascii"
                  title="NO_THREADS"
                  description="Find an item you like and message the seller."
                />
              </div>
            ) : (
              <ul className="divide-y divide-line">
                {filtered.map((c) => {
                  const other = c.participants.find((p) => p.id !== me.id) ?? c.participants[0]!;
                  const isActive = c.id === activeId;
                  return (
                    <li key={c.id}>
                      <button
                        type="button"
                        onClick={() => setActiveId(c.id)}
                        className={cn(
                          "flex w-full items-start gap-3 p-3 text-left transition-colors",
                          isActive ? "bg-ink-200" : "hover:bg-ink-200",
                        )}
                      >
                        <div className="relative">
                          <Avatar src={other.avatar} name={other.name} size="lg" status={other.verified ? "online" : "idle"} />
                          {c.unreadCount > 0 && (
                            <span className="absolute -right-0.5 -top-0.5 grid h-4 min-w-4 place-items-center border border-signal bg-signal px-1 text-[9px] tabular-nums text-ink">
                              {c.unreadCount}
                            </span>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <div className="min-w-0 flex-1 truncate text-sm text-fg">{other.name}</div>
                            <div className="shrink-0 font-mono text-[9px] tabular-nums text-fg-subtle">
                              {timeAgo(c.updatedAt)}
                            </div>
                          </div>
                          {c.listing && (
                            <div className="mt-0.5 truncate font-mono text-[9px] uppercase tracking-[0.18em] text-fg-subtle">
                              RE: {c.listing.title}
                            </div>
                          )}
                          <div className="mt-1 line-clamp-2 text-xs text-fg-muted">
                            {c.lastMessage?.content ?? "No messages yet"}
                          </div>
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </aside>

        {/* Pane */}
        <section className="flex h-full min-h-0 flex-col">
          {!active ? (
            <div className="grid flex-1 place-items-center p-6">
              <EmptyState
                variant="ascii"
                title="NO_THREAD_SELECTED"
                description="Pick a conversation on the left to start chatting."
              />
            </div>
          ) : (
            <Thread
              conversation={active}
              messages={messagesByConv[active.id] ?? []}
              draft={draft}
              setDraft={setDraft}
              send={send}
              scrollRef={scrollRef}
              meId={me.id}
            />
          )}
        </section>
      </div>
    </Page>
  );
}

function Thread({
  conversation,
  messages,
  draft,
  setDraft,
  send,
  scrollRef,
  meId,
}: {
  conversation: Conversation;
  messages: Message[];
  draft: string;
  setDraft: (v: string) => void;
  send: () => void;
  scrollRef: React.RefObject<HTMLDivElement>;
  meId: string;
}) {
  const other = conversation.participants.find((p) => p.id !== meId) ?? conversation.participants[0]!;

  return (
    <>
      <header className="flex items-center justify-between gap-3 border-b border-line p-3">
        <div className="flex min-w-0 items-center gap-3">
          <Avatar src={other.avatar} name={other.name} size="lg" status={other.verified ? "online" : "idle"} />
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h2 className="truncate text-sm font-semibold text-fg">{other.name}</h2>
              {other.verified && (
                <CheckCircle2 className="h-3.5 w-3.5 text-success" strokeWidth={1.5} />
              )}
            </div>
            <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-fg-subtle">
              @{other.username} · {conversation.listing ? "RE: " + conversation.listing.title : "DIRECT"}
            </div>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          <StatusDot status={other.verified ? "online" : "idle"} label />
          <button className="grid h-8 w-8 place-items-center border border-line text-fg-muted hover:border-fg-subtle hover:text-fg">
            <Phone className="h-3.5 w-3.5" strokeWidth={1.5} />
          </button>
          <button className="grid h-8 w-8 place-items-center border border-line text-fg-muted hover:border-fg-subtle hover:text-fg">
            <Info className="h-3.5 w-3.5" strokeWidth={1.5} />
          </button>
          <button className="grid h-8 w-8 place-items-center border border-line text-fg-muted hover:border-fg-subtle hover:text-fg">
            <MoreVertical className="h-3.5 w-3.5" strokeWidth={1.5} />
          </button>
        </div>
      </header>

      {conversation.listing && (
        <div className="flex items-center gap-3 border-b border-line bg-ink-200 p-3">
          <div className="h-12 w-12 shrink-0">
            <ImageWithFallback
              src={conversation.listing.images[0]?.url}
              alt={conversation.listing.title}
              aspect="square"
            />
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm text-fg">{conversation.listing.title}</div>
            <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-fg-subtle">
              ₹{conversation.listing.price.toLocaleString("en-IN")}
            </div>
          </div>
          <Badge variant="default" size="sm">RE: LISTING</Badge>
        </div>
      )}

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4">
        <div className="mx-auto flex max-w-2xl flex-col gap-2">
          <div className="my-2 flex items-center gap-3 font-mono text-[9px] uppercase tracking-[0.2em] text-fg-subtle">
            <Separator className="flex-1" />
            <span>{formatClock(new Date())}</span>
            <Separator className="flex-1" />
          </div>
          {messages.map((m, idx) => (
            <Bubble key={m.id} message={m} isMe={m.sender.id === meId} prev={messages[idx - 1]} />
          ))}
        </div>
      </div>

      <div className="border-t border-line p-3">
        <div className="flex items-end gap-2">
          <button
            className="grid h-10 w-10 shrink-0 place-items-center border border-line text-fg-muted hover:border-fg-subtle hover:text-fg"
            aria-label="Attach image"
          >
            <ImageIcon className="h-3.5 w-3.5" strokeWidth={1.5} />
          </button>
          <button
            className="grid h-10 w-10 shrink-0 place-items-center border border-line text-fg-muted hover:border-fg-subtle hover:text-fg"
            aria-label="Attach file"
          >
            <Paperclip className="h-3.5 w-3.5" strokeWidth={1.5} />
          </button>
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
            placeholder="Type a message…"
            rows={1}
            className="h-10 max-h-32 min-h-10 flex-1 resize-none border border-line bg-ink-200 px-3 py-2.5 text-sm text-fg placeholder:text-fg-subtle focus:border-fg focus:outline-none"
          />
          <button
            type="button"
            onClick={send}
            disabled={!draft.trim()}
            className="grid h-10 w-10 shrink-0 place-items-center border border-signal bg-signal text-ink transition-colors hover:bg-ink hover:text-signal disabled:opacity-40"
            aria-label="Send"
          >
            <Send className="h-3.5 w-3.5" strokeWidth={2} />
          </button>
        </div>
        <div className="mt-2 flex items-center justify-between font-mono text-[9px] uppercase tracking-[0.2em] text-fg-subtle">
          <span>ENTER to send · SHIFT+ENTER for new line</span>
          <span>{draft.length}/1000</span>
        </div>
      </div>
    </>
  );
}

function Bubble({
  message,
  isMe,
  prev,
}: {
  message: Message;
  isMe: boolean;
  prev?: Message;
}) {
  const grouped = prev?.sender.id === message.sender.id;
  return (
    <div className={cn("flex items-end gap-2", isMe ? "justify-end" : "justify-start")}>
      {!isMe && (
        <div className="w-7">
          {!grouped && <Avatar src={message.sender.avatar} name={message.sender.name} size="sm" />}
        </div>
      )}
      <div className={cn("max-w-[78%] space-y-1", isMe && "items-end")}>
        <div
          className={cn(
            "border px-3 py-2 text-sm",
            isMe
              ? "border-signal bg-signal/10 text-fg"
              : "border-line bg-ink-200 text-fg",
          )}
        >
          {message.content}
        </div>
        <div className={cn("flex items-center gap-1 font-mono text-[9px] uppercase tracking-[0.18em] text-fg-subtle", isMe ? "justify-end" : "justify-start")}>
          <span className="tabular-nums">{timeAgo(message.createdAt)}</span>
          {isMe && message.read && (
            <CheckCheck className="h-2.5 w-2.5 text-cyan" strokeWidth={1.5} />
          )}
        </div>
      </div>
    </div>
  );
}

function pickReply(draft: string): string {
  const d = draft.toLowerCase();
  if (d.includes("price") || d.includes("₹") || d.includes("cost")) {
    return "Best I can do is ₹200 less. Can pickup tonight if that works.";
  }
  if (d.includes("available") || d.includes("still")) {
    return "Yep, still up. Common room at 6 works?";
  }
  if (d.includes("time") || d.includes("when") || d.includes("pickup")) {
    return "Tomorrow between 5–7 pm. Drop a pin if you can't find the block.";
  }
  if (d.includes("hi") || d.includes("hello") || d.includes("hey")) {
    return "Hey! Yes, still up. What are you thinking?";
  }
  return "Got it. Let me check and circle back in a few.";
}
