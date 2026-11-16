"use client";

import { useMemo, useState, useTransition } from "react";
import { CheckCircle2, Mail, RefreshCw, Send, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  addSubscriberAction,
  cancelBroadcastAction,
  cancelEmailAction,
  deleteBroadcastAction,
  duplicateBroadcastAction,
  getBroadcastAction,
  removeSubscriberAction,
  removeSuppressionAction,
  saveBroadcastAction,
  sendBroadcastAction,
  sendTestAction,
  setUnsubscribedAction,
  syncSubscribersAction,
  verifyDomainAction,
  type ActionResult,
} from "@/lib/actions/newsletter-admin";
import type * as newsletter from "@/lib/newsletter";
import { extractNewsletterSource, renderNewsletterHtml } from "@/lib/newsletter-template";
import { cn } from "@/lib/utils";

type Loaded<T> = { data: T | null; error: string | null };
type Overview = Awaited<ReturnType<typeof newsletter.getOverview>>;
type Subscribers = Awaited<ReturnType<typeof newsletter.listSubscribers>>;
type Broadcasts = Awaited<ReturnType<typeof newsletter.listBroadcasts>>;
type Emails = Awaited<ReturnType<typeof newsletter.listEmails>>;
type Suppressions = Awaited<ReturnType<typeof newsletter.listSuppressions>>;

interface NewsletterPanelProps {
  adminEmail: string;
  overview: Loaded<Overview>;
  subscribers: Loaded<Subscribers>;
  broadcasts: Loaded<Broadcasts>;
  emails: Loaded<Emails>;
  suppressions: Loaded<Suppressions>;
}

type Notice = { kind: "ok" | "error"; text: string } | null;

const fmt = (iso: string | null | undefined) =>
  iso
    ? new Date(iso.replace(" ", "T")).toLocaleString("en-GB", {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : "—";

const labelClass = "text-caption font-medium";
const textareaClass =
  "border-input bg-background ring-ring/24 focus-visible:border-ring w-full rounded-lg border px-2.5 py-2 text-sm outline-none focus-visible:ring-2";

/** Runs a server action, surfaces its outcome as a notice. */
function useRunner(setNotice: (n: Notice) => void) {
  const [pending, startTransition] = useTransition();
  const run = <T,>(
    action: () => Promise<ActionResult<T>>,
    success: string | ((data: T) => string),
    after?: (data: T) => void,
  ) =>
    startTransition(async () => {
      const result = await action();
      if (result.ok) {
        setNotice({ kind: "ok", text: typeof success === "string" ? success : success(result.data) });
        after?.(result.data);
      } else {
        setNotice({ kind: "error", text: result.error });
      }
    });
  return { pending, run };
}

export function NewsletterPanel(props: NewsletterPanelProps) {
  const [notice, setNotice] = useState<Notice>(null);
  const [composer, setComposer] = useState<ComposerState | null>(null);
  const { pending, run } = useRunner(setNotice);

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-h2">Newsletter</h1>
          <p className="text-body-small text-muted-foreground">
            Subscribers, broadcasts and emails — managed in Resend from here.
          </p>
        </div>
        <Button onClick={() => setComposer(emptyComposer())} disabled={pending}>
          <Mail /> New broadcast
        </Button>
      </div>

      {notice && (
        <p
          role="status"
          className={cn(
            "rounded-lg border px-3 py-2 text-body-small",
            notice.kind === "ok"
              ? "border-green-600/30 bg-green-600/5 text-foreground"
              : "border-destructive/30 bg-destructive/10 text-destructive",
          )}
        >
          {notice.text}
        </p>
      )}

      <OverviewCard loaded={props.overview} run={run} pending={pending} />

      {composer && (
        <Composer
          key={composer.id ?? "new"}
          initial={composer}
          adminEmail={props.adminEmail}
          onClose={() => setComposer(null)}
          setNotice={setNotice}
        />
      )}

      <BroadcastsCard
        loaded={props.broadcasts}
        run={run}
        pending={pending}
        onEdit={(state) => setComposer(state)}
        setNotice={setNotice}
      />
      <SubscribersCard loaded={props.subscribers} run={run} pending={pending} />
      <EmailsCard loaded={props.emails} run={run} pending={pending} />
      <SuppressionsCard loaded={props.suppressions} run={run} pending={pending} />
    </div>
  );
}

type Run = ReturnType<typeof useRunner>["run"];

function LoadError({ error }: { error: string | null }) {
  return error ? <p className="text-body-small text-destructive">{error}</p> : null;
}

// ---------------------------------------------------------------------------

function OverviewCard({ loaded, run, pending }: { loaded: Loaded<Overview>; run: Run; pending: boolean }) {
  const o = loaded.data;
  const stats: [string, number | undefined][] = o?.last7Days
    ? [
        ["Delivered", o.last7Days.delivered],
        ["Opened", o.last7Days.unique_opened ?? o.last7Days.opened],
        ["Clicked", o.last7Days.unique_clicked ?? o.last7Days.clicked],
        ["Bounced", o.last7Days.bounced],
      ]
    : [];
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-body font-semibold">Overview</CardTitle>
        {o && <CardDescription>Sending as {o.from}</CardDescription>}
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        <LoadError error={loaded.error} />
        {o && (
          <>
            <div className="flex flex-wrap gap-2">
              {o.domains.map((d) => (
                <span key={d.id} className="flex items-center gap-2">
                  <Badge variant={d.status === "verified" ? "secondary" : "destructive"}>
                    {d.name} · {d.status}
                  </Badge>
                  {d.status !== "verified" && (
                    <Button
                      size="xs"
                      variant="outline"
                      disabled={pending}
                      onClick={() => run(() => verifyDomainAction(d.id), `Verification started for ${d.name}.`)}
                    >
                      Verify
                    </Button>
                  )}
                </span>
              ))}
            </div>
            <dl className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <Stat label="Sign-ups (site)" value={o.subscribersInDatabase} />
              <Stat
                label="In Resend list"
                value={o.contacts ? `${o.contacts.total}${o.contacts.more ? "+" : ""}` : 0}
              />
              <Stat label="Unsubscribed" value={o.contacts?.unsubscribed ?? 0} />
              <Stat label="List" value={o.segment?.name ?? "created on first sync"} />
            </dl>
            {stats.length > 0 && (
              <>
                <p className="text-caption font-bold tracking-[0.2em] text-muted-foreground uppercase">
                  Last 7 days
                </p>
                <dl className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                  {stats.map(([label, value]) => (
                    <Stat key={label} label={label} value={value ?? 0} />
                  ))}
                </dl>
              </>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex flex-col gap-0.5">
      <dt className="text-caption text-muted-foreground">{label}</dt>
      <dd className="text-h4 font-semibold">{value}</dd>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Composer
// ---------------------------------------------------------------------------

interface ComposerState {
  id: string | null;
  name: string;
  subject: string;
  previewText: string;
  body: string;
}

const emptyComposer = (): ComposerState => ({
  id: null,
  name: "",
  subject: "",
  previewText: "",
  body: "Hi there,\n\n",
});

function Composer({
  initial,
  adminEmail,
  onClose,
  setNotice,
}: {
  initial: ComposerState;
  adminEmail: string;
  onClose: () => void;
  setNotice: (n: Notice) => void;
}) {
  const [state, setState] = useState(initial);
  const [testTo, setTestTo] = useState(adminEmail);
  const [scheduleAt, setScheduleAt] = useState("");
  const { pending, run } = useRunner(setNotice);
  const html = useMemo(
    () => renderNewsletterHtml(state.body, state.previewText),
    [state.body, state.previewText],
  );
  const set = (key: keyof ComposerState) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setState((s) => ({ ...s, [key]: e.target.value }));

  const draft = () => ({ name: state.name, subject: state.subject, previewText: state.previewText, html });

  /** Save first (create or update), then optionally send/schedule. */
  const save = (then?: "send" | "schedule") => {
    if (then === "send" && !window.confirm(`Send "${state.subject}" to the whole list now?`)) return;
    if (then === "schedule" && !scheduleAt) {
      setNotice({ kind: "error", text: "Pick a date and time to schedule." });
      return;
    }
    run(
      () => saveBroadcastAction(state.id, draft()),
      then ? "Saved." : "Draft saved.",
      ({ id }) => {
        setState((s) => ({ ...s, id }));
        if (!then) return;
        const when = then === "schedule" ? new Date(scheduleAt).toISOString() : undefined;
        run(
          () => sendBroadcastAction(id, when),
          when ? `Scheduled for ${fmt(when)}.` : "Broadcast is sending.",
          onClose,
        );
      },
    );
  };

  return (
    <Card className="border-foreground">
      <CardHeader>
        <CardTitle className="text-body font-semibold">
          {state.id ? "Edit broadcast" : "New broadcast"}
        </CardTitle>
        <CardDescription>
          Write in plain text: blank line = new paragraph, <code># Heading</code>,{" "}
          <code>- bullet</code>, <code>**bold**</code>, <code>[link](https://…)</code>.
          An unsubscribe link is added automatically.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6 lg:grid-cols-2">
        <div className="flex flex-col gap-4">
          <Field label="Subject" htmlFor="nl-subject">
            <Input id="nl-subject" value={state.subject} onChange={set("subject")} required />
          </Field>
          <Field label="Preview text (shown next to the subject in inboxes)" htmlFor="nl-preview">
            <Input id="nl-preview" value={state.previewText} onChange={set("previewText")} />
          </Field>
          <Field label="Internal name (optional)" htmlFor="nl-name">
            <Input id="nl-name" value={state.name} onChange={set("name")} placeholder="Defaults to the subject" />
          </Field>
          <Field label="Body" htmlFor="nl-body">
            <textarea id="nl-body" rows={14} value={state.body} onChange={set("body")} className={textareaClass} />
          </Field>

          <div className="flex flex-wrap items-end gap-2 border-t border-border pt-4">
            <Field label="Send a test to" htmlFor="nl-test">
              <Input id="nl-test" type="email" value={testTo} onChange={(e) => setTestTo(e.target.value)} className="w-64" />
            </Field>
            <Button
              variant="outline"
              disabled={pending || !state.subject}
              onClick={() => run(() => sendTestAction(testTo, state.subject, html), `Test sent to ${testTo}.`)}
            >
              <Send /> Send test
            </Button>
          </div>

          <div className="flex flex-wrap items-end gap-2 border-t border-border pt-4">
            <Button variant="outline" disabled={pending || !state.subject} onClick={() => save()}>
              Save draft
            </Button>
            <Button disabled={pending || !state.subject} onClick={() => save("send")}>
              Send to list now
            </Button>
            <Field label="or schedule" htmlFor="nl-when">
              <Input id="nl-when" type="datetime-local" value={scheduleAt} onChange={(e) => setScheduleAt(e.target.value)} />
            </Field>
            <Button variant="outline" disabled={pending || !state.subject} onClick={() => save("schedule")}>
              Schedule
            </Button>
            <Button variant="ghost" onClick={onClose} disabled={pending}>
              Close
            </Button>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <p className={labelClass}>Preview</p>
          <iframe
            title="Email preview"
            srcDoc={html}
            sandbox=""
            className="h-[640px] w-full rounded-lg border border-border bg-white"
          />
        </div>
      </CardContent>
    </Card>
  );
}

function Field({ label, htmlFor, children }: { label: string; htmlFor: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} className={labelClass}>{label}</label>
      {children}
    </div>
  );
}

// ---------------------------------------------------------------------------

const STATUS_VARIANT: Record<string, "secondary" | "outline" | "default"> = {
  draft: "outline",
  queued: "secondary",
  sent: "default",
};

function BroadcastsCard({
  loaded,
  run,
  pending,
  onEdit,
  setNotice,
}: {
  loaded: Loaded<Broadcasts>;
  run: Run;
  pending: boolean;
  onEdit: (state: ComposerState) => void;
  setNotice: (n: Notice) => void;
}) {
  const [stats, setStats] = useState<Record<string, string>>({});

  const open = (id: string) =>
    run(() => getBroadcastAction(id), "Loaded.", (b) => {
      if (b.status === "sent") {
        const t = b.stats ?? {};
        setStats((s) => ({
          ...s,
          [id]: `Delivered ${t.delivered ?? 0} · opened ${t.unique_opened ?? t.opened ?? 0} · clicked ${t.unique_clicked ?? t.clicked ?? 0} · bounced ${t.bounced ?? 0} · unsubscribed ${t.unsubscribed ?? 0}`,
        }));
        return;
      }
      const source = extractNewsletterSource(b.html);
      if (source == null) {
        setNotice({ kind: "error", text: "This draft was made outside the dashboard — edit it in Resend." });
        return;
      }
      onEdit({ id: b.id, name: b.name, subject: b.subject ?? "", previewText: b.previewText ?? "", body: source });
    });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-body font-semibold">Broadcasts</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col divide-y divide-border">
        <LoadError error={loaded.error} />
        {loaded.data?.length === 0 && (
          <p className="text-body-small text-muted-foreground">No broadcasts yet.</p>
        )}
        {loaded.data?.map((b) => (
          <div key={b.id} className="flex flex-col gap-2 py-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-body-small font-medium">{b.name}</p>
                <p className="text-caption text-muted-foreground">
                  {b.status === "sent"
                    ? `Sent ${fmt(b.sentAt)}`
                    : b.scheduledAt
                      ? `Scheduled ${fmt(b.scheduledAt)}`
                      : `Created ${fmt(b.createdAt)}`}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                <Badge variant={STATUS_VARIANT[b.status] ?? "outline"}>{b.status}</Badge>
                <Button size="xs" variant="outline" disabled={pending} onClick={() => open(b.id)}>
                  {b.status === "sent" ? "Stats" : "Edit"}
                </Button>
                {b.status === "queued" && (
                  <Button size="xs" variant="outline" disabled={pending}
                    onClick={() => run(() => cancelBroadcastAction(b.id), "Schedule cancelled — back to draft.")}>
                    Cancel schedule
                  </Button>
                )}
                <Button size="xs" variant="outline" disabled={pending}
                  onClick={() => run(() => duplicateBroadcastAction(b.id), "Duplicated as a new draft.")}>
                  Duplicate
                </Button>
                {b.status === "draft" && (
                  <Button size="xs" variant="ghost" disabled={pending} aria-label={`Delete ${b.name}`}
                    onClick={() => window.confirm(`Delete draft "${b.name}"?`) &&
                      run(() => deleteBroadcastAction(b.id), "Draft deleted.")}>
                    <Trash2 />
                  </Button>
                )}
              </div>
            </div>
            {stats[b.id] && <p className="text-caption text-muted-foreground">{stats[b.id]}</p>}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------

function SubscribersCard({ loaded, run, pending }: { loaded: Loaded<Subscribers>; run: Run; pending: boolean }) {
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const data = loaded.data;

  return (
    <Card>
      <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-3">
        <div>
          <CardTitle className="text-body font-semibold">Subscribers</CardTitle>
          <CardDescription>
            Sign-ups from the website and RSVPs. Sync pushes new ones into the Resend list.
          </CardDescription>
        </div>
        <Button
          variant="outline"
          disabled={pending || !data || data.notSynced === 0}
          onClick={() =>
            run(() => syncSubscribersAction(), (r) =>
              `Added ${r.added} to Resend.${r.failed.length ? ` ${r.failed.length} failed: ${r.failed[0]}` : ""}`)
          }
        >
          <RefreshCw /> Sync {data?.notSynced ? `${data.notSynced} new` : ""}
        </Button>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <LoadError error={loaded.error} />
        <form
          className="flex flex-wrap items-end gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            run(() => addSubscriberAction(email, firstName), `Added ${email}.`, () => {
              setEmail("");
              setFirstName("");
            });
          }}
        >
          <Field label="Email" htmlFor="sub-email">
            <Input id="sub-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-64" />
          </Field>
          <Field label="First name" htmlFor="sub-name">
            <Input id="sub-name" value={firstName} onChange={(e) => setFirstName(e.target.value)} className="w-40" />
          </Field>
          <Button type="submit" variant="outline" disabled={pending}>Add subscriber</Button>
        </form>

        {data?.subscribers.length === 0 && (
          <p className="text-body-small text-muted-foreground">No subscribers yet.</p>
        )}
        {data && data.subscribers.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-body-small">
              <thead className="text-left text-caption text-muted-foreground">
                <tr className="border-b border-border">
                  <th className="py-2 pr-3 font-medium">Email</th>
                  <th className="py-2 pr-3 font-medium">Name</th>
                  <th className="py-2 pr-3 font-medium">Source</th>
                  <th className="py-2 pr-3 font-medium">Status</th>
                  <th className="py-2 font-medium"><span className="sr-only">Actions</span></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {data.subscribers.map((s) => (
                  <tr key={s.email}>
                    <td className="py-2 pr-3">{s.email}</td>
                    <td className="py-2 pr-3">{s.firstName || "—"}</td>
                    <td className="py-2 pr-3 text-muted-foreground">{s.source}</td>
                    <td className="py-2 pr-3">
                      {!s.inResend ? (
                        <Badge variant="outline">not synced</Badge>
                      ) : s.unsubscribed ? (
                        <Badge variant="secondary">unsubscribed</Badge>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-green-700">
                          <CheckCircle2 className="size-3.5" /> subscribed
                        </span>
                      )}
                    </td>
                    <td className="py-2 text-right whitespace-nowrap">
                      {s.inResend && (
                        <Button size="xs" variant="ghost" disabled={pending}
                          onClick={() => run(() => setUnsubscribedAction(s.email, !s.unsubscribed),
                            s.unsubscribed ? `Resubscribed ${s.email}.` : `Unsubscribed ${s.email}.`)}>
                          {s.unsubscribed ? "Resubscribe" : "Unsubscribe"}
                        </Button>
                      )}
                      <Button size="xs" variant="ghost" disabled={pending} aria-label={`Remove ${s.email}`}
                        onClick={() => window.confirm(`Remove ${s.email} from the list and the database?`) &&
                          run(() => removeSubscriberAction(s.email), `Removed ${s.email}.`)}>
                        <Trash2 />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------

function EmailsCard({ loaded, run, pending }: { loaded: Loaded<Emails>; run: Run; pending: boolean }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-body font-semibold">Recent emails</CardTitle>
        <CardDescription>Everything sent from the domain — login links, tests, one-offs.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col divide-y divide-border">
        <LoadError error={loaded.error} />
        {loaded.data?.length === 0 && <p className="text-body-small text-muted-foreground">Nothing sent yet.</p>}
        {loaded.data?.map((e) => (
          <div key={e.id} className="flex flex-wrap items-center justify-between gap-3 py-2.5">
            <div className="min-w-0">
              <p className="truncate text-body-small font-medium">{e.subject}</p>
              <p className="truncate text-caption text-muted-foreground">
                {e.to.join(", ")} · {fmt(e.createdAt)}
              </p>
            </div>
            <div className="flex items-center gap-1.5">
              <Badge variant={["bounced", "failed", "complained"].includes(e.lastEvent) ? "destructive" : "secondary"}>
                {e.lastEvent}
              </Badge>
              {e.lastEvent === "scheduled" && (
                <Button size="xs" variant="outline" disabled={pending}
                  onClick={() => run(() => cancelEmailAction(e.id), "Scheduled email cancelled.")}>
                  Cancel
                </Button>
              )}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function SuppressionsCard({ loaded, run, pending }: { loaded: Loaded<Suppressions>; run: Run; pending: boolean }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-body font-semibold">Suppressed addresses</CardTitle>
        <CardDescription>
          Resend stops sending to addresses that bounced or complained. Remove one only if
          you&apos;re sure the address now works.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col divide-y divide-border">
        <LoadError error={loaded.error} />
        {loaded.data?.length === 0 && <p className="text-body-small text-muted-foreground">None — all good.</p>}
        {loaded.data?.map((s) => (
          <div key={s.email} className="flex items-center justify-between gap-3 py-2.5">
            <p className="text-body-small">
              {s.email} <span className="text-caption text-muted-foreground">· {s.origin} · {fmt(s.createdAt)}</span>
            </p>
            <Button size="xs" variant="ghost" disabled={pending}
              onClick={() => window.confirm(`Allow sending to ${s.email} again?`) &&
                run(() => removeSuppressionAction(s.email), `${s.email} can receive emails again.`)}>
              Remove
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
