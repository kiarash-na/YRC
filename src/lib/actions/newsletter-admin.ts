"use server";

import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/lib/admin";
import * as newsletter from "@/lib/newsletter";
import { withoutUnsubscribePlaceholder } from "@/lib/newsletter-template";

/**
 * Admin Newsletter tab actions. Each re-verifies the caller with
 * requireAdmin(), runs one operation from @/lib/newsletter and returns a
 * result the client can show — never throws to the client.
 */

export type ActionResult<T = unknown> =
  | { ok: true; data: T }
  | { ok: false; error: string };

async function run<T>(fn: () => Promise<T>): Promise<ActionResult<T>> {
  await requireAdmin();
  try {
    const data = await fn();
    revalidatePath("/admin/newsletter");
    return { ok: true, data };
  } catch (error) {
    const message =
      error instanceof newsletter.NewsletterError
        ? error.message
        : "Something went wrong — check the server logs.";
    if (!(error instanceof newsletter.NewsletterError)) {
      console.error("newsletter action failed:", error);
    }
    return { ok: false, error: message };
  }
}

export async function syncSubscribersAction() {
  return run(() => newsletter.syncSubscribers());
}

export async function addSubscriberAction(email: string, firstName: string) {
  return run(() => newsletter.addSubscriber(email, firstName));
}

export async function setUnsubscribedAction(email: string, unsubscribed: boolean) {
  return run(() => newsletter.setUnsubscribed(email, unsubscribed));
}

export async function removeSubscriberAction(email: string) {
  return run(() => newsletter.removeSubscriber(email));
}

export async function getBroadcastAction(id: string) {
  return run(() => newsletter.getBroadcast(id));
}

export async function saveBroadcastAction(
  id: string | null,
  draft: newsletter.BroadcastDraft,
) {
  return run(async () => ({
    id: id
      ? (await newsletter.updateBroadcast(id, draft)).id
      : (await newsletter.createBroadcast(draft)).id,
  }));
}

export async function sendBroadcastAction(id: string, scheduledAt?: string) {
  return run(() => newsletter.sendBroadcast(id, scheduledAt || undefined));
}

export async function cancelBroadcastAction(id: string) {
  return run(() => newsletter.cancelBroadcast(id));
}

export async function duplicateBroadcastAction(id: string) {
  return run(() => newsletter.duplicateBroadcast(id));
}

export async function deleteBroadcastAction(id: string) {
  return run(() => newsletter.deleteBroadcast(id));
}

/** "Send test": the draft to one address (defaults to the admin's own). */
export async function sendTestAction(to: string, subject: string, html: string) {
  return run(() =>
    newsletter.sendEmail({
      to,
      subject: `[Test] ${subject}`,
      html: withoutUnsubscribePlaceholder(html),
    }),
  );
}

export async function cancelEmailAction(id: string) {
  return run(() => newsletter.cancelEmail(id));
}

export async function removeSuppressionAction(email: string) {
  return run(() => newsletter.removeSuppression(email));
}

export async function verifyDomainAction(domainId: string) {
  return run(() => newsletter.verifyDomain(domainId));
}
