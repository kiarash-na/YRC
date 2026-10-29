// On-brand auth email for YRC — monochrome + YRC yellow (#ffcc04), Poppins.
// One template parameterized per Supabase email_action_type.

import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from "npm:@react-email/components@0.0.22";
import React from "npm:react@18.3.1";

export interface EmailCopy {
  preview: string;
  heading: string;
  body: string;
  button: string;
}

/** Copy per Supabase email_action_type. Unknown types fall back to magiclink. */
export function copyForType(type: string): EmailCopy {
  switch (type) {
    case "signup":
      return {
        preview: "Confirm your YRC account",
        heading: "Welcome to YRC",
        body: "One tap to confirm your account and join the runs, points and check-ins.",
        button: "Confirm account",
      };
    case "recovery":
      return {
        preview: "Reset your YRC access",
        heading: "Reset access",
        body: "We received a recovery request for your YRC account. This link expires shortly.",
        button: "Recover access",
      };
    case "email_change":
      return {
        preview: "Confirm your new YRC email",
        heading: "Confirm new email",
        body: "Confirm this address to finish changing the email on your YRC account.",
        button: "Confirm new email",
      };
    case "invite":
      return {
        preview: "You're invited to YRC",
        heading: "You're invited",
        body: "Yas Rise Company — community runs, races and check-ins. Accept to get started.",
        button: "Accept invite",
      };
    case "magiclink":
    default:
      return {
        preview: "Your YRC login link",
        heading: "Log in to YRC",
        body: "Tap below to log in — no password needed. This link expires shortly and works once.",
        button: "Log in",
      };
  }
}

export function subjectForType(type: string): string {
  switch (type) {
    case "signup": return "Confirm your YRC account";
    case "recovery": return "Reset your YRC access";
    case "email_change": return "Confirm your new YRC email";
    case "invite": return "You're invited to YRC";
    default: return "Your YRC login link";
  }
}

const YELLOW = "#ffcc04";
const BLACK = "#0b0b0b";
const GRAY = "#6b6b6b";
const BORDER = "#e6e6e6";

const font = "'Poppins', 'Helvetica Neue', Arial, sans-serif";

export function AuthEmail({ copy, actionUrl }: { copy: EmailCopy; actionUrl: string }) {
  return (
    <Html>
      <Head>
        {/* Poppins where the client supports webfonts; Arial fallback elsewhere */}
        <link
          href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap"
          rel="stylesheet"
        />
      </Head>
      <Preview>{copy.preview}</Preview>
      <Body style={{ backgroundColor: "#ffffff", fontFamily: font, margin: 0 }}>
        {/* brand bar */}
        <Section style={{ backgroundColor: BLACK, padding: "20px 24px" }}>
          <Text
            style={{
              color: YELLOW,
              fontSize: "18px",
              fontWeight: 700,
              letterSpacing: "0.3em",
              margin: 0,
              textTransform: "uppercase",
            }}
          >
            Yas Rise
          </Text>
        </Section>

        <Container style={{ padding: "40px 24px", maxWidth: "480px" }}>
          <Heading
            style={{ color: BLACK, fontSize: "28px", fontWeight: 700, margin: "0 0 12px" }}
          >
            {copy.heading}
          </Heading>
          <Text style={{ color: GRAY, fontSize: "15px", lineHeight: "24px", margin: "0 0 32px" }}>
            {copy.body}
          </Text>

          <Button
            href={actionUrl}
            style={{
              backgroundColor: YELLOW,
              borderRadius: "10px",
              color: BLACK,
              display: "inline-block",
              fontSize: "15px",
              fontWeight: 600,
              padding: "14px 32px",
              textDecoration: "none",
            }}
          >
            {copy.button}
          </Button>

          <Text style={{ color: GRAY, fontSize: "12px", lineHeight: "18px", marginTop: "32px" }}>
            If the button doesn&apos;t work, paste this link into your browser:
          </Text>
          <Text style={{ color: GRAY, fontSize: "12px", wordBreak: "break-all", margin: "4px 0 0" }}>
            {actionUrl}
          </Text>
        </Container>

        <Section
          style={{
            borderTop: `1px solid ${BORDER}`,
            padding: "20px 24px",
          }}
        >
          <Text style={{ color: GRAY, fontSize: "11px", margin: 0 }}>
            Yas Rise Company · yasrise.run — you received this because a login was
            requested for this address. If it wasn&apos;t you, ignore this email.
          </Text>
        </Section>
      </Body>
    </Html>
  );
}

export default AuthEmail;
