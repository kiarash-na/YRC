"use client";

import { ArrowRight } from "lucide-react";
import * as React from "react";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { subscribeToNewsletter } from "@/lib/actions/newsletter";

interface Blog56Props {
  label?: string;
  heading?: string;
  description?: string;
  emailPlaceholder?: string;
  subscribeLabel?: string;
  successLabel?: string;
  className?: string;
}

const defaultProps: Required<
  Pick<
    Blog56Props,
    | "label"
    | "heading"
    | "description"
    | "emailPlaceholder"
    | "subscribeLabel"
    | "successLabel"
  >
> = {
  label: "Newsletter",
  heading: "STAY IN THE LOOP.",
  description:
    "Running ideas, training insights, community stories and upcoming YRC experiences — delivered when there's something worth sharing.",
  emailPlaceholder: "Your email",
  subscribeLabel: "SUBSCRIBE",
  successLabel: "You're on the list. See you out there.",
};

type Props = Partial<Blog56Props>;

const Blog56 = (props: Props) => {
  const {
    label,
    heading,
    description,
    emailPlaceholder,
    subscribeLabel,
    successLabel,
    className,
  } = {
    ...defaultProps,
    ...props,
  };

  const [email, setEmail] = React.useState("");
  const [submitted, setSubmitted] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [isPending, startTransition] = React.useTransition();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setErrorMessage(null);
    startTransition(async () => {
      const result = await subscribeToNewsletter(formData);
      if (result.status === "subscribed") {
        setSubmitted(true);
      } else {
        setErrorMessage(result.message);
      }
    });
  };

  return (
    <section className={cn("bg-background pb-32", className)}>
      <div className="container">
        <div className="mx-auto flex max-w-5xl flex-col gap-8 rounded-xl border border-border p-7 sm:p-12 lg:flex-row lg:items-end lg:justify-between lg:gap-16">
          <div className="flex max-w-xl flex-col gap-7">
            <p className="text-caption font-bold tracking-[0.3em] text-muted-foreground uppercase">
              {label}
            </p>
            <h2 className="text-h2 md:text-h1">{heading}</h2>
            <p className="text-body-small text-muted-foreground md:text-body">
              {description}
            </p>
          </div>

          <div className="w-full max-w-md shrink-0">
            {submitted ? (
              <div
                role="status"
                className="flex items-center gap-2 rounded-xl border border-border bg-muted px-4 py-3 text-body-small font-medium"
              >
                {successLabel}
              </div>
            ) : (
              <>
                <form
                  onSubmit={handleSubmit}
                  className="flex flex-col gap-3 sm:flex-row"
                >
                  <input
                    type="text"
                    name="company"
                    tabIndex={-1}
                    autoComplete="off"
                    className="hidden"
                    aria-hidden="true"
                  />
                  <Input
                    type="email"
                    name="email"
                    required
                    placeholder={emailPlaceholder}
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    aria-label="Email address"
                    className="h-11 flex-1 text-body-small"
                  />
                  <Button
                    type="submit"
                    size="lg"
                    className="h-11 px-6"
                    disabled={isPending}
                  >
                    {isPending ? "Subscribing…" : subscribeLabel}
                    <ArrowRight className="size-4" />
                  </Button>
                </form>
                {errorMessage && (
                  <p role="alert" className="mt-3 text-caption text-destructive">
                    {errorMessage}
                  </p>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export { Blog56 };
