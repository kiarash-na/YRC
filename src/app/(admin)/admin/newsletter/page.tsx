import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { NewsletterPanel } from "@/components/admin-newsletter";
import { requireAdmin } from "@/lib/admin";
import * as newsletter from "@/lib/newsletter";

// Live Resend data on every visit.
export const dynamic = "force-dynamic";

async function settle<T>(promise: Promise<T>): Promise<{ data: T | null; error: string | null }> {
  try {
    return { data: await promise, error: null };
  } catch (error) {
    return {
      data: null,
      error: error instanceof newsletter.NewsletterError ? error.message : "Couldn't load from Resend.",
    };
  }
}

export default async function AdminNewsletterPage() {
  const { seat } = await requireAdmin();

  if (!newsletter.newsletterConfigured()) {
    return (
      <div className="mx-auto flex max-w-3xl flex-col gap-6">
        <h1 className="text-h2">Newsletter</h1>
        <Card>
          <CardHeader>
            <CardTitle className="text-body font-semibold">Resend isn&apos;t connected</CardTitle>
          </CardHeader>
          <CardContent className="text-body-small text-muted-foreground">
            Set <code>RESEND_API_KEY</code> in this environment (Dokploy / Vercel /
            .env.local) to manage subscribers, broadcasts and emails here.
          </CardContent>
        </Card>
      </div>
    );
  }

  const [overview, subscribers, broadcasts, emails, suppressions] = await Promise.all([
    settle(newsletter.getOverview()),
    settle(newsletter.listSubscribers()),
    settle(newsletter.listBroadcasts()),
    settle(newsletter.listEmails(20)),
    settle(newsletter.listSuppressions()),
  ]);

  return (
    <NewsletterPanel
      adminEmail={seat.email}
      overview={overview}
      subscribers={subscribers}
      broadcasts={broadcasts}
      emails={emails}
      suppressions={suppressions}
    />
  );
}
