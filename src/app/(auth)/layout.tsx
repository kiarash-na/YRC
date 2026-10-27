import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "YRC Members",
};

/** Bare centered layout for login / profile / check-in — no site chrome. */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="flex min-h-svh flex-1 flex-col items-center justify-center bg-muted p-6">
      {children}
    </main>
  );
}
