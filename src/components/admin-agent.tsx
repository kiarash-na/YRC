"use client";

import type Anthropic from "@anthropic-ai/sdk";
import Link from "next/link";
import { Fragment, useEffect, useRef, useState, useTransition, type ReactNode } from "react";
import { ArrowUp, Check, CircleAlert, LoaderCircle, RotateCcw, Sparkles, Wrench, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { agentTurn, type PendingCall } from "@/lib/actions/agent";
import { cn } from "@/lib/utils";

type Message = Anthropic.Beta.BetaMessageParam;
type Block = Anthropic.Beta.BetaContentBlockParam;

const SUGGESTIONS = [
  "What's coming up in the next two weeks?",
  "Who registered for the next event?",
  "Duplicate the last social run to next Saturday",
  "Show newsletter stats for the last 7 days",
  "Draft a newsletter about our upcoming events",
  "Who are the top 5 members by points?",
];

function blocks(message: Message): Block[] {
  return typeof message.content === "string"
    ? [{ type: "text", text: message.content }]
    : (message.content ?? []);
}

/** **bold** and site-relative paths (/events/x, /admin/y) → links. */
function richText(text: string): ReactNode[] {
  return text.split(/(\*\*[^*]+\*\*|(?<![\w.])\/(?:events|admin|profile|journal)[\w\-/]*)/g).map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) return <strong key={i}>{part.slice(2, -2)}</strong>;
    if (part.startsWith("/")) {
      return (
        <Link key={i} href={part} className="underline underline-offset-2" target="_blank">
          {part}
        </Link>
      );
    }
    return <Fragment key={i}>{part}</Fragment>;
  });
}

function toolLabel(name: string) {
  return name.replaceAll("_", " ");
}

export function AgentChat({ configured }: { configured: boolean }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [pending, setPending] = useState<PendingCall[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [busy, startTransition] = useTransition();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, pending, busy]);

  // tool_use id → outcome, read from the tool_result blocks.
  const outcomes = new Map<string, "ok" | "error">();
  for (const m of messages) {
    for (const b of blocks(m)) {
      if (b.type === "tool_result") outcomes.set(b.tool_use_id, b.is_error ? "error" : "ok");
    }
  }

  function advance(history: Message[], approvals?: Record<string, boolean>) {
    setError(null);
    setPending([]);
    startTransition(async () => {
      const result = await agentTurn(history, approvals);
      setMessages(result.messages);
      if (result.ok) setPending(result.pending);
      else setError(result.error);
    });
  }

  function send(text: string) {
    const content = text.trim();
    if (!content || busy || pending.length > 0) return;
    setDraft("");
    const history: Message[] = [...messages, { role: "user", content }];
    setMessages(history);
    advance(history);
  }

  function decide(approve: boolean) {
    advance(messages, Object.fromEntries(pending.map((p) => [p.id, approve])));
  }

  function decideOne(id: string, approve: boolean) {
    // Partial decisions: everything not explicitly approved is declined.
    advance(messages, Object.fromEntries(pending.map((p) => [p.id, p.id === id ? approve : false])));
  }

  const empty = messages.length === 0;

  return (
    <div className="flex min-h-[70vh] flex-col rounded-xl border border-border bg-card">
      <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-3">
        <div className="flex items-center gap-2">
          <Sparkles className="size-4 text-foreground" aria-hidden />
          <span className="text-body-small font-semibold">Agent</span>
          <span className="text-caption text-muted-foreground">
            Reads freely · asks before changing anything
          </span>
        </div>
        {!empty && (
          <Button
            size="xs"
            variant="ghost"
            disabled={busy}
            onClick={() => {
              setMessages([]);
              setPending([]);
              setError(null);
            }}
          >
            <RotateCcw /> New chat
          </Button>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-5 overflow-y-auto px-5 py-6">
        {!configured && (
          <p className="rounded-lg border border-yrc-accent bg-yrc-accent/10 px-4 py-3 text-body-small">
            Set <code>ANTHROPIC_API_KEY</code> in this environment (Dokploy / Vercel / .env.local) to use the
            Agent.
          </p>
        )}

        {empty && (
          <div className="flex flex-col gap-4">
            <p className="text-body-small text-muted-foreground">
              Ask in plain words — events, registrations, points, admins, newsletter. Changes always wait for
              your confirmation.
            </p>
            <div className="flex flex-wrap gap-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  disabled={!configured || busy}
                  onClick={() => send(s)}
                  className="rounded-full border border-border px-3 py-1.5 text-caption transition-colors hover:bg-muted disabled:opacity-50"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m, i) =>
          m.role === "user" ? (
            blocks(m).some((b) => b.type === "text") ? (
              <div key={i} className="ml-auto max-w-[85%] rounded-2xl bg-foreground px-4 py-2.5 text-body-small text-background whitespace-pre-wrap">
                {blocks(m).map((b) => (b.type === "text" ? b.text : "")).join("\n")}
              </div>
            ) : null
          ) : (
            <div key={i} className="flex max-w-[92%] flex-col gap-2">
              {blocks(m).map((b, j) => {
                if (b.type === "text" && b.text.trim()) {
                  return (
                    <div key={j} className="text-body-small leading-relaxed whitespace-pre-wrap">
                      {richText(b.text)}
                    </div>
                  );
                }
                if (b.type === "tool_use") {
                  const outcome = outcomes.get(b.id);
                  return (
                    <span
                      key={j}
                      className={cn(
                        "inline-flex w-fit items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-caption text-muted-foreground",
                        outcome === "error" ? "border-destructive/40 text-destructive" : "border-border",
                      )}
                    >
                      {outcome === "ok" ? (
                        <Check className="size-3 text-emerald-600" />
                      ) : outcome === "error" ? (
                        <CircleAlert className="size-3" />
                      ) : (
                        <Wrench className="size-3" />
                      )}
                      {toolLabel(b.name)}
                    </span>
                  );
                }
                return null;
              })}
            </div>
          ),
        )}

        {pending.length > 0 && (
          <div className="flex max-w-xl flex-col gap-3 rounded-xl border border-yrc-accent bg-yrc-accent/10 p-4">
            <p className="text-caption font-semibold tracking-[0.2em] text-muted-foreground uppercase">
              Confirm {pending.length === 1 ? "this change" : `${pending.length} changes`}
            </p>
            <ul className="flex flex-col gap-2">
              {pending.map((p) => (
                <li key={p.id} className="flex flex-col gap-1.5">
                  <div className="flex items-start justify-between gap-3">
                    <span className="text-body-small font-medium">{p.summary}</span>
                    {pending.length > 1 && (
                      <span className="flex shrink-0 gap-1">
                        <Button size="xs" variant="outline" onClick={() => decideOne(p.id, true)}>
                          Only this
                        </Button>
                      </span>
                    )}
                  </div>
                  <details className="text-caption text-muted-foreground">
                    <summary className="cursor-pointer">Details</summary>
                    <pre className="mt-1 max-h-64 overflow-auto rounded-md bg-muted p-2 whitespace-pre-wrap">
                      {JSON.stringify(p.input, null, 2)}
                    </pre>
                  </details>
                </li>
              ))}
            </ul>
            <div className="flex gap-2">
              <Button size="sm" onClick={() => decide(true)}>
                <Check /> Confirm
              </Button>
              <Button size="sm" variant="outline" onClick={() => decide(false)}>
                <X /> Cancel
              </Button>
            </div>
          </div>
        )}

        {busy && (
          <div className="flex items-center gap-2 text-caption text-muted-foreground">
            <LoaderCircle className="size-3.5 animate-spin" /> Working…
          </div>
        )}

        {error && (
          <p className="rounded-lg border border-destructive/40 bg-destructive/5 px-4 py-3 text-body-small text-destructive">
            {error}
          </p>
        )}

        <div ref={bottomRef} />
      </div>

      <form
        className="flex items-end gap-2 border-t border-border p-3"
        onSubmit={(e) => {
          e.preventDefault();
          send(draft);
        }}
      >
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
              e.preventDefault();
              send(draft);
            }
          }}
          rows={2}
          placeholder={pending.length > 0 ? "Confirm or cancel the change above first" : "Ask the Agent…"}
          disabled={!configured || busy || pending.length > 0}
          className="min-h-11 flex-1 resize-none rounded-lg border border-input bg-transparent px-3 py-2 text-body-small outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-60"
        />
        <Button
          type="submit"
          size="icon-lg"
          aria-label="Send"
          disabled={!configured || busy || pending.length > 0 || !draft.trim()}
        >
          <ArrowUp />
        </Button>
      </form>
    </div>
  );
}
