"use client";

import { ArrowRight, LoaderIcon } from "lucide-react";
import { useId, useState, useTransition } from "react";
import { cn } from "@/lib/utils";

import { Reveal } from "@/components/reveal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { subscribeToNewsletter } from "@/lib/actions/newsletter";

interface Perk {
  title: string;
  description: string;
}

interface NewsletterSignupProps {
  eyebrow?: string;
  heading?: React.ReactNode;
  description?: string;
  emailPlaceholder?: string;
  buttonText?: string;
  successMessage?: string;
  perks?: Perk[];
  className?: string;
}

const defaultPerks: Perk[] = [
  {
    title: "Runs first",
    description:
      "New events, weekly routes and race-day meetups before they fill up.",
  },
  {
    title: "One training note",
    description:
      "A practical tip from our coaches: pacing, strength or recovery.",
  },
  {
    title: "No filler",
    description:
      "Only when there's something worth sharing. Unsubscribe any time.",
  },
];

/**
 * Pre-footer newsletter panel (shadcnblocks newsletter6, adapted): heading
 * and email field, then three numbered perks under a hairline rule. Submits
 * through the existing subscribeToNewsletter server action (with its
 * honeypot), so no client form library is needed.
 */
const NewsletterSignup = ({
  eyebrow = "Newsletter",
  heading = (
    <>
      Stay in the <span className="text-yrc-accent">loop.</span>
    </>
  ),
  description = "Running ideas, training insights, community stories and upcoming YRC experiences, delivered when there's something worth sharing.",
  emailPlaceholder = "Your email",
  buttonText = "Subscribe",
  successMessage = "You're on the list. See you out there.",
  perks = defaultPerks,
  className,
}: NewsletterSignupProps) => {
  const emailId = useId();
  const errorId = useId();
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setError(null);
    startTransition(async () => {
      try {
        const result = await subscribeToNewsletter(formData);
        if (result.status === "subscribed") setSubmitted(true);
        else setError(result.message);
      } catch {
        setError("Something went wrong. Please try again.");
      }
    });
  };

  const items = perks.slice(0, 3);

  return (
    <section className={cn("py-24 md:py-32", className)}>
      <div className="container">
        <Reveal className="relative flex flex-col gap-12 overflow-hidden rounded-xl bg-muted/50 p-7 sm:p-10 md:p-12 lg:gap-16 lg:p-16">
          {/* Dot grid fading out from the top-left corner. */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(color-mix(in_oklch,var(--color-foreground)_18%,transparent)_1px,transparent_1px)] mask-[radial-gradient(ellipse_55%_70%_at_0%_0%,black_0%,transparent_62%)] bg-size-[14px_14px] opacity-70"
          />

          <div className="relative flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between">
            <div className="flex max-w-3xl flex-col gap-4">
              <p className="text-caption font-bold tracking-[0.3em] text-muted-foreground uppercase">
                {eyebrow}
              </p>
              <h2 className="text-h2 text-balance uppercase md:text-h1">
                {heading}
              </h2>
              <p className="max-w-xl text-body-small text-muted-foreground md:text-body">
                {description}
              </p>
            </div>

            <div className="w-full max-w-md shrink-0">
              {submitted ? (
                <div
                  role="status"
                  className="rounded-lg bg-background px-4 py-3 text-body-small font-medium"
                >
                  {successMessage}
                </div>
              ) : (
                <form
                  onSubmit={handleSubmit}
                  className="flex flex-col gap-3"
                >
                  {/* Honeypot: hidden from people, filled by bots. */}
                  <input
                    type="text"
                    name="company"
                    tabIndex={-1}
                    autoComplete="off"
                    className="hidden"
                    aria-hidden="true"
                  />
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
                    <label htmlFor={emailId} className="sr-only">
                      Email address
                    </label>
                    <Input
                      id={emailId}
                      type="email"
                      name="email"
                      required
                      autoComplete="email"
                      placeholder={emailPlaceholder}
                      aria-invalid={error ? true : undefined}
                      aria-describedby={error ? errorId : undefined}
                      className="h-12 w-full border-border bg-background text-body-small sm:flex-1"
                    />
                    <Button
                      type="submit"
                      size="lg"
                      className="h-12 bg-yrc-accent px-6 tracking-wider text-yrc-accent-foreground uppercase hover:bg-yrc-accent/85"
                      disabled={isPending}
                    >
                      {isPending ? (
                        <LoaderIcon className="animate-spin" aria-hidden="true" />
                      ) : null}
                      {isPending ? "Subscribing…" : buttonText}
                      {!isPending && <ArrowRight aria-hidden="true" />}
                    </Button>
                  </div>
                  {error && (
                    <p id={errorId} role="alert" className="text-caption text-destructive">
                      {error}
                    </p>
                  )}
                </form>
              )}
            </div>
          </div>

          {items.length > 0 && (
            <ul className="relative grid grid-cols-1 gap-8 border-t border-border pt-10 md:grid-cols-3">
              {items.map((perk, index) => (
                <li key={perk.title} className="flex flex-col gap-2">
                  <span className="text-caption font-bold tracking-[0.3em] text-yrc-accent tabular-nums">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <p className="text-h4 font-semibold">{perk.title}</p>
                  <p className="text-body-small leading-relaxed text-muted-foreground">
                    {perk.description}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </Reveal>
      </div>
    </section>
  );
};

export { NewsletterSignup };
